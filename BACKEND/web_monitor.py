
import eventlet
eventlet.monkey_patch()

from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
import io
import base64
from PIL import Image, ImageDraw, ImageFont 
import requests
from datetime import datetime
from zoneinfo import ZoneInfo
import time
import cv2
import boto3          # NCP Object Storage를 사용하고 싶은 경우, 반드시 설치
from ultralytics import YOLO
import os
os.environ.setdefault("TORCH_CPP_LOG_LEVEL", "ERROR")
os.environ.setdefault("GLOG_minloglevel", "2")
import torch
import numpy as np
from typing import Union
import os
from eventlet.greenpool import GreenPool


# =================================================================
#                         0.사전 설정
# =================================================================

# [ Object Storage 업로드를 위한 사전 설정 ]
# Python 3.13 버전과 boto3 최신 버전을 사용하기 위해 사전 설정
os.environ.setdefault("AWS_REQUEST_CHECKSUM_CALCULATION", "when_required")
os.environ.setdefault("AWS_RESPONSE_CHECKSUM_VALIDATION", "when_required")


# [ numpy → 파이썬 타입 변환 설정 ]
def _to_py(obj):
    import numpy as np
    if isinstance(obj, (np.bool_,)):
        return bool(obj)
    if isinstance(obj, (np.integer,)):
        return int(obj)
    if isinstance(obj, (np.floating,)):
        return float(obj)
    if isinstance(obj, (np.ndarray,)):
        return obj.tolist()
    if isinstance(obj, dict):
        return {k: _to_py(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [_to_py(v) for v in obj]
    return obj


# [ Ultralytics 모델 클래스 신뢰 ]
# PyTorch의 보안 로딩 정책에 Ultralytics 모델 클래스를 신뢰할 수 있도록 추가합니다.
# 이 코드는 YOLO 모델을 로딩하기 *전에* 실행되어야 합니다.
try:
    # YOLO 모델 아키텍처를 구성하는 데 필요한 거의 모든 클래스를 import 합니다.
    from torch.nn.modules.container import Sequential
    from ultralytics.nn.tasks import DetectionModel
    from ultralytics.nn.modules import (
        Conv, C2f, Bottleneck, Concat, SPPF, Detect
    )
    
    # 신뢰할 수 있는 클래스 목록 전체를 한 번에 추가합니다.
    torch.serialization.add_safe_globals([
        DetectionModel, Sequential, Conv, C2f, 
        Bottleneck, Concat, SPPF, Detect
    ])
    print("✅ PyTorch safe globals에 YOLO 필수 모델 클래스들 추가 성공!")
except Exception as e:
    print(f"⚠️ PyTorch safe globals 설정 중 경고 발생: {e}")


# [ 영상 전송 파라미터 ]
# 실효 전송 상한 (서버측 쓰로틀)         0.20s ~= 5fps, 0.125s ~= 8fps
MIN_INTERVAL = float(os.getenv("AI_MIN_INTERVAL", "0.05"))

# 서버가 권장하는 미리보기 FPS (프론트가 받으면 간격을 맞추게 됨)
SERVER_TARGET_FPS = float(os.getenv("SERVER_TARGET_FPS", "20.0"))
AI_PARALLEL = int(os.getenv("AI_PARALLEL", "3"))    # 동시 실행 모델 수(최대 3)

# 공용 그린풀 (요청마다 새로 만들지 않고 재사용)
GREEN_POOL = GreenPool(size=AI_PARALLEL)


# =================================================================
#               1. Flask 앱 및 SocketIO 서버 초기화
# =================================================================

app = Flask(__name__)
# cors_allowed_origins="*" : React 개발 서버 등 모든 주소에서의 연결을 허용
# socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")/
socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    async_mode="eventlet",
    ping_interval=25,
    ping_timeout=60,
    max_http_buffer_size=8 * 1024 * 1024,
)

# =================================================================
#               1-1. 전역 상태 관리 변수 (수정) 
# =================================================================

# [ 현재 메인 화면으로 선택된 장비의 ID ]
main_device_id = None

# [ 하단 버튼에 대한 전역 탐지 기능 On/Off 상태 ]
global_toggle_states = {
    'ppe': False,
    'acc': False,
    'he': False
}

# [ OCR 재시도 횟수 기록을 위한 전역 변수 및 상수 추가 ]
heavy_equipment_ocr_attempts = {}
OCR_RETRY_THRESHOLD = 1                 # 동일 ID에 대한 OCR 실패 허용 횟수
last_ocr_call_ts = 0.0                  # OCR 호출 최후 시각
OCR_COOLDOWN_SEC = 0.8                  # OCR 최소 호출 간격(초) (상황에 따라 0.5 - 2.0로 조정)
FRAME_STRIDE_FOR_OCR = 3                # n프레임마다만 OCR 시도
ocr_backoff_until = 0.0                 # 실패 시 백오프 종료 시각 (time.time() 기준)
he_frame_counter = 0                    # detect_he() 호출 카운터


# [ 동시 처리 변수 ]
processing_inflight = set()
last_frame_ts = {}


# [ 첫 화면 영상 스트림 상태 ]
current_video_stream = None
thread_for_video_processing = None
current_stream_owner_sid = None 


# [ 오래된 키 메모리 주기적 정리 ]
CLEANUP_INTERVAL_SEC = 60      # 설정값 (초) 마다 정리
TRACK_TTL_SEC        = 300     # 설정값 (초) 지나면 트랙 관련 캐시 제거
COOLDOWN_TTL_SEC     = 900     # 설정값 (초) 지나면 기록 쿨다운 키 제거
FRAME_TS_TTL_SEC     = 600     # 설정값 (초) 지난 last_frame_ts 제거

# [ 중장비 OCR 재시도/활동 추적용 ]
# stale 제거 위해 마지막 본 시각 기록
he_last_seen = {}


# [ 한글 폰트 자동 탐색 + 캐싱 ]
_SELECTED_FONT = None
_FONT_CACHE = {}

def load_korean_font(size=24):
    if size in _FONT_CACHE:
        return _FONT_CACHE[size]
    
    global _SELECTED_FONT
    candidates = [
        # 사전에 설치된 나눔 폰트를 가져와서 사용
        os.path.join("fonts", "NanumGothic.ttf"),
        os.path.join("fonts", "NanumGothicBold.ttf"),
        "/usr/share/fonts/truetype/nanum/NanumGothic.ttf",
        "/usr/share/fonts/truetype/nanum/NanumGothicBold.ttf",
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
        "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                font = ImageFont.truetype(path, size=size, index=0)
                _SELECTED_FONT = path
                _FONT_CACHE[size] = font
                print(f"[font] using: {path}")
                return font
            except Exception:
                pass
    print("[font] fallback: default")
    # 최후 폴백 (영문 전용인 경우)
    font = ImageFont.load_default()
    _FONT_CACHE[size] = font
    return font


# [ 바운딩 박스 표시 종류 설정 ]
SHOW_PPE_GEAR_BOXES = int(os.getenv("SHOW_PPE_GEAR_BOXES", "0")) # 기본 off


# =================================================================
#                 2. 탐지유형별 AI 모델 함수 호출
# =================================================================

# [ AI 모델 로딩 ]  
print("AI 모델을 로딩합니다...")             # (서버 시작 시 한 번만 실행)
if torch.cuda.is_available():
    print("CUDA is available! Using GPU.")
    device = "cuda"
else:
    print("CUDA is not available. Using CPU.")
    device = "cpu"

try:
    # 안전장비 착용여부 탐지 모델 
    ppe_model = YOLO("models/ppe_model(11s + 50).pt").to(device)        # 최종적으로 ppe_model.pt 로 이름 수정
    # 사고감지 모델
    acc_model = YOLO("models/yolo11s-pose.pt").to(device)               # 최종적으로 acc_model.pt 로 이름 수정
    # 중장비 탐지 모델
    he_model = YOLO("models/he_model(11s + 40).pt").to(device)          # 최종적으로 he_model.pt 로 이름 수정
        # 중장비 탐지 모델
    base_model = YOLO("models/yolo11s-track.pt").to(device)             # 최종적으로 base_model.pt 로 이름 수정

    print("✅ AI 모델 로딩 성공!")
except Exception as e:
    print(f"❌ AI 모델 로딩 실패: {e}")
    exit()


# -----------------------------------
#        안전장비 착용여부 AI
# -----------------------------------

# PPE에서 사람 트랙용 모델 선정
# 기본값으로 YOLOv11 기본 모델 사용함
USE_BASE_FOR_PPE = int(os.getenv("USE_BASE_FOR_PPE", "1"))  # 1=on, 0=off

# 사람 탐지 설정
PERSON_LABEL = 'person'

# 안전장비 착용여부 설정
SAFETY_LABELS = {
    'wear': ['Safety Helmet wear', 'Safety Belt wear', 'Safety Hook wear', 'Safety Shoes wear'],
    'unwear': ['Safety Helmet unwear', 'Safety Belt unwear', 'Safety Hook unwear', 'Safety Shoes unwear']
}
PERSON_BBOX_EXPANSION_FACTOR = 0.10


# [ 안전장비 착용 여부 탐지 함수 ]
def detect_ppe(image_bytes):
    # PIL Image를 OpenCV 프레임으로 변환
    image = Image.open(io.BytesIO(image_bytes))
    frame = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

    detections = []
    violations_to_record = []
    

    # 1. 사람 객체 탐지 
    # 사람이라는 객체를 탐지하기 위해 기본 모델을 사용함 (설정가능)
    if USE_BASE_FOR_PPE and 'base_model' in globals() and base_model is not None:
        person_results = base_model.track(
            frame, persist=True, conf=0.25, iou=0.5, max_det=50, verbose=False, classes=[0] # 사람 객체
        )
    else:
        person_results = acc_model.track(
            frame, persist=True, conf=0.25, iou=0.5, max_det=50, verbose=False
        )

    person_detections = []
    for r in person_results:
        if r.boxes.id is not None:
            for box in r.boxes:
                cls = int(box.cls[0])
                class_name = r.names[cls]
                if class_name == PERSON_LABEL:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    conf = float(box.conf[0])
                    track_id = int(box.id.cpu().numpy().item())
                    person_detections.append({
                        'class_name': class_name, 
                        'confidence': conf, 
                        'bbox': (x1, y1, x2, y2), 
                        'track_id': track_id
                    })
                    detections.append({
                        'box': [x1, y1, x2, y2], 
                        'label': f"{class_name} (ID: {track_id})", 
                        'confidence': conf, 
                        'track_id': track_id,
                        'source': 'ppe',
                        'kind': 'person'
                    })
    

    # 2. 안전 장비 위반 탐지 
    # 안전장비 착용여부를 탐지하기 위해 ppe_model 사용함
    safety_gear_results = ppe_model(frame, stream=True)

    safety_gear_detections = []
    gear_out = []

    def _parse_gear(name: str):
        n = name.lower()
        part = "unknown"
        if "helmet" in n: part = "helmet"
        elif "belt" in n: part = "belt"
        elif "hook" in n: part = "hook"
        elif "shoes" in n: part = "shoes"
        state = "wear" if "unwear" not in n else "unwear"
        return part, state

    for r in safety_gear_results:
        for box in r.boxes:
            cls = int(box.cls[0])
            class_name = r.names[cls]
            # 착용/미착용 모든 안전장비 라벨을 탐지
            if class_name in SAFETY_LABELS['wear'] + SAFETY_LABELS['unwear']:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                conf = float(box.conf[0])
                safety_gear_detections.append({
                    'class_name': class_name, 
                    'confidence': conf, 
                    'bbox': (x1, y1, x2, y2)
                })


    # 사람 박스의 확장영역 미리 계산 (장비-사람 매칭용)
    people_expanded = []
    for p in person_detections:
        px1, py1, px2, py2 = p['bbox']
        pw, ph = px2 - px1, py2 - py1
        ex = int(pw * PERSON_BBOX_EXPANSION_FACTOR / 2)
        ey = int(ph * PERSON_BBOX_EXPANSION_FACTOR / 2)
        exp = (
            max(0, px1 - ex), max(0, py1 - ey),
            min(frame.shape[1], px2 + ex), min(frame.shape[0], py2 + ey)
        )
        people_expanded.append({**p, 'exp_bbox': exp})

    # 장비 박스를 가장 가까운 (혹은 포함하는) 사람 트랙에 연결해서 gear_out 생성
    for s in safety_gear_detections:
        sx1, sy1, sx2, sy2 = s['bbox']
        cx, cy = (sx1 + sx2) / 2.0, (sy1 + sy2) / 2.0
        parent_tid = None
        for pe in people_expanded:
            ex1, ey1, ex2, ey2 = pe['exp_bbox']
            if ex1 <= cx <= ex2 and ey1 <= cy <= ey2:
                parent_tid = pe['track_id']
                break

        part, state = _parse_gear(s['class_name'])
        gear_out.append({
            'box': [sx1, sy1, sx2, sy2],
            'label': s['class_name'],
            'confidence': s['confidence'],
            'kind': 'gear',                # 프론트에서 색 구분 가능
            'source': 'ppe_gear',
            'gear_part': part,             # helmet / belt / hook / shoes
            'gear_state': state,           # wear / unwear
            'parent_track_id': parent_tid  # 연결된 사람 트랙 (없으면 None)
        })

    final_detections = []
    violators = [] 

    # 3. 사람 바운딩 박스 내에 위반 사항이 있는지 확인
    for p_det in person_detections:
        px1, py1, px2, py2 = p_det['bbox']
        # ㅇ 바운딩 박스 확장
        pw, ph = px2 - px1, py2 - py1
        ex, ey = int(pw * PERSON_BBOX_EXPANSION_FACTOR / 2), int(ph * PERSON_BBOX_EXPANSION_FACTOR / 2)
        px1_exp, py1_exp = max(0, px1 - ex), max(0, py1 - ey)
        px2_exp, py2_exp = min(frame.shape[1], px2 + ex), min(frame.shape[0], py2 + ey)

        # ㅇ 확장된 바운딩 박스에 해당하는 위반 사항 찾기
        person_safety_labels = set()
        for s_det in safety_gear_detections:
            sx1, sy1, sx2, sy2 = s_det['bbox']
            if (sx1 >= px1_exp and sy1 >= py1_exp and sx2 <= px2_exp and sy2 <= py2_exp):
                person_safety_labels.add(s_det['class_name'])

        final_detections.append({
            'box': [px1, py1, px2, py2],
            'label': f"person (ID: {p_det['track_id']})",
            'confidence': p_det['confidence'],
            'safety_status': list(person_safety_labels),
            'track_id': p_det['track_id'],
            'source': 'ppe',
            'kind': 'person' 
        })

        if any(lbl in SAFETY_LABELS['unwear'] for lbl in person_safety_labels):
            violators.append((p_det['track_id'], person_safety_labels))

    # 반환 직전 장비 박스도 포함해서 프론트로 전달
    final_for_ui = final_detections + (gear_out if SHOW_PPE_GEAR_BOXES else [])


    # 기록 전송용 위반 객체들 : 최종 박스 세트(final_for_front)를 함께 넘겨 그려짐
    for tid, labels in violators:
        violations_to_record.append({
            'track_id': tid,
            'labels': labels,
            'image': image,
            'detections': final_detections + gear_out
        })

    return final_for_ui, violations_to_record


# -----------------------------------
#           사고 감지 AI
# -----------------------------------

# 낙상 감지 설정
# FALL_RATIO_THRESHOLD = 0.8
# FALL_COUNT_THRESHOLD = 5        # 낙상으로 판단하기 위한 연속 프레임 수
# fall_status = {}                # track_id 별 낙상 카운트를 저장


# [ COCO 17 Keypoints 인덱스 정의 ]
NOSE = 0
L_SHOULDER, R_SHOULDER = 5, 6
L_HIP, R_HIP = 11, 12
L_KNEE, R_KNEE = 13, 14
L_ANKLE, R_ANKLE = 15, 16

# [ 다중 규칙 + 가중치 ] (튜닝 포인트)
CRITERIA = {
    "aspect_ratio":     {"weight": 1.0, "test": lambda ar: ar < 0.72},
    "vertical_sh_hip":  {"weight": 1.2, "test": lambda v: v < 0.26},
    "nose_avg_upper":   {"weight": 0.8, "test": lambda nose_y, avg_upper_y: nose_y > avg_upper_y},
    "angle":            {"weight": 1.2, "test": lambda angle: abs(angle) < 42},
    "hip_ankle":        {"weight": 1.0, "test": lambda hip_y, ankle_y: hip_y > ankle_y - 5},
    "y_std":            {"weight": 0.7, "test": lambda y_std: y_std < 48},
    "head_foot_dist":   {"weight": 0.8, "test": lambda d: d < 0.36},
    "center_y":         {"weight": 1.0, "test": lambda cy, h: cy > h * 0.67},
    "shoulder_hip_hip_ankle": {"weight": 1.0, "test": lambda s, ha: s < 0.21 and ha < 0.26},
    "hip_knee":         {"weight": 0.8, "test": lambda d: d < 0.24},
    "y_range":          {"weight": 1.0, "test": lambda r: r < 230},
}


# [ 점수 임계치 ] (튜닝 포인트)
FALLEN_SCORE_THRESHOLD = 4.0


# [ 프레임 연속 임계치 ] (기존 값 재사용)
FALL_COUNT_THRESHOLD = 5          # 연속 5프레임 이상이면 확정 낙상
fall_status = {}                  # {track_id: {"count": int}}

def evaluate_criteria(kps_xy: np.ndarray, frame: np.ndarray):

    # kps_xy : (17, 2) 형태의 x,y 좌표만 (YOLO kpts.xy)
    # frame  : BGR frame (H,W,3)
    # return : (각 규칙 결과 dict, 총점 float)

    xs, ys = kps_xy[:, 0], kps_xy[:, 1]
    width = float(np.max(xs) - np.min(xs) + 1e-5)
    height = float(np.max(ys) - np.min(ys) + 1e-5)
    aspect_ratio = height / width

    l_sh_y, r_sh_y = kps_xy[L_SHOULDER][1], kps_xy[R_SHOULDER][1]
    l_hip_y, r_hip_y = kps_xy[L_HIP][1], kps_xy[R_HIP][1]
    mean_sh_y = (l_sh_y + r_sh_y) / 2.0
    mean_hip_y = (l_hip_y + r_hip_y) / 2.0
    vertical_sh_hip = abs(mean_sh_y - mean_hip_y) / height

    nose_y = kps_xy[NOSE][1]
    avg_upper_y = np.mean([l_sh_y, r_sh_y, l_hip_y, r_hip_y])

    dx = ((kps_xy[L_SHOULDER][0] + kps_xy[R_SHOULDER][0]) / 2.0) - ((kps_xy[L_HIP][0] + kps_xy[R_HIP][0]) / 2.0)
    dy = mean_sh_y - mean_hip_y
    angle = np.degrees(np.arctan2(dy, dx))

    hip_y = min(l_hip_y, r_hip_y)
    ankle_y = min(kps_xy[L_ANKLE][1], kps_xy[R_ANKLE][1])

    y_std = float(np.std(ys))
    center_y = float(np.mean(ys))
    head_foot_dist = abs(nose_y - np.mean([kps_xy[L_ANKLE][1], kps_xy[R_ANKLE][1]])) / height

    shoulder_y = mean_sh_y
    hip_y2 = mean_hip_y
    ankle_y2 = float(np.mean([kps_xy[L_ANKLE][1], kps_xy[R_ANKLE][1]]))
    knee_y = float(np.mean([kps_xy[L_KNEE][1], kps_xy[R_KNEE][1]]))
    shoulder_hip_dist = abs(shoulder_y - hip_y2) / height
    hip_ankle_dist = abs(hip_y2 - ankle_y2) / height
    hip_knee_dist = abs(hip_y2 - knee_y) / height

    y_range = float(np.ptp(ys))
    h = frame.shape[0]

    feats = dict(
        aspect_ratio=aspect_ratio,
        vertical_sh_hip=vertical_sh_hip,
        nose_avg_upper=(nose_y, avg_upper_y),
        angle=angle,
        hip_ankle=(hip_y, ankle_y),
        y_std=y_std,
        head_foot_dist=head_foot_dist,
        center_y=(center_y, h),
        shoulder_hip_hip_ankle=(shoulder_hip_dist, hip_ankle_dist),
        hip_knee=hip_knee_dist,
        y_range=y_range
    )

    results = {}
    score = 0.0
    for k, cfg in CRITERIA.items():
        try:
            if k == "nose_avg_upper":
                v = cfg["test"](*feats["nose_avg_upper"])
            elif k == "hip_ankle":
                v = cfg["test"](*feats["hip_ankle"])
            elif k == "center_y":
                v = cfg["test"](*feats["center_y"])
            elif k == "shoulder_hip_hip_ankle":
                v = cfg["test"](*feats["shoulder_hip_hip_ankle"])
            else:
                v = cfg["test"](feats.get(k, 0))
        except Exception:
            v = False
        results[k] = bool(v)
        if v:
            score += float(cfg["weight"])

    return results, float(score)


# [ 사고 감지 (낙상) 함수 ]
def detect_acc(image_bytes):
    """사고(낙상)를 감지하는 함수"""

    # YOLO Pose 트래킹 + 다중 규칙 점수화로 낙상 감지.
    # 프레임별 점수 >= FALLEN_SCORE_THRESHOLD 이면 후보로 카운트 +1
    # 같은 track_id가 FALL_COUNT_THRESHOLD 연속 충족 시 '낙상 확정'

    print("AI: 사고 감지 모듈 호출")
    
    image = Image.open(io.BytesIO(image_bytes))
    frame = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

    detections = []
    violations_to_record = []

    # YOLO pose 추적 (ID 유지)
    results = acc_model.track(frame, persist=True, conf=0.25, iou=0.5, max_det=50, verbose=False)

    for r in results:
        if r.boxes.id is None:
            continue

        boxes = r.boxes.xyxy.cpu().numpy().astype(int)
        track_ids = r.boxes.id.cpu().numpy().astype(int)

        # kpts.xy : (N, 17, 2) — 좌표만 사용
        if r.keypoints is not None and hasattr(r.keypoints, "xy"):
            kpts_xy_all = r.keypoints.xy.cpu().numpy()
        else:
            kpts_xy_all = [None] * len(track_ids)

        for box, tid, kps_xy in zip(boxes, track_ids, kpts_xy_all):
            x1, y1, x2, y2 = [int(v) for v in box.tolist()]

            is_violation = False
            score = 0.0
            kps_xy_safe = []

            if kps_xy is not None and np.shape(kps_xy)[0] >= 17:
                # 규칙 평가 (오류 나면 후보 무효 처리)
                try:
                    conditions, score = evaluate_criteria(kps_xy, frame)
                    is_candidate = (score >= FALLEN_SCORE_THRESHOLD)
                except Exception:
                    is_candidate = False

                # 연속 카운트 업데이트
                now_ts = time.time()
                prev = fall_status.get(int(tid), {"count": 0})["count"]
                curr = prev + 1 if is_candidate else 0
                fall_status[int(tid)] = {"count": curr, "ts": now_ts}

                # 최종 확정 조건
                is_violation = (curr >= FALL_COUNT_THRESHOLD)
                kps_xy_safe = kps_xy
            else:
                # 키포인트가 없으면 낙상 아님으로 처리
                fall_status[int(tid)] = {"count": 0}

            det = {
                "box": [x1, y1, x2, y2],
                "label": f"person (ID: {int(tid)})",
                "is_falling": bool(is_violation),
                "track_id": int(tid),
                "keypoints": _to_py(kps_xy_safe) if len(np.shape(kps_xy_safe)) > 0 else [],
                "source": "acc",    # 트래킹 모델 : acc 모델
                "kind": "person"    # 트래킹 대상 : 사람
            }
            detections.append(det)

            if is_violation:
                violations_to_record.append({
                    "track_id": int(tid),
                    "labels": ["fallen"],   # 필요 시 ["slip"], ["trip"] 등으로 확장 가능
                    "image": image,         # 원본 PIL 이미지
                    "detections": detections.copy()
                })

    return detections, violations_to_record
          


# -----------------------------------
#           중장비 출입 AI
# -----------------------------------

# [ 중장비 종류별 색상 매핑 ]
HE_COLOR_MAP = {
    'DumpTruck_1t_under': (255, 105, 180), # HotPink
    'DumpTruck_5t_under': (255, 0, 255),   # Magenta
    'DumpTruck_12t_under': (148, 0, 211),  # DarkViolet
    'DumpTruck_12t_over': (75, 0, 130),    # Indigo
    'Excavator_Tire': (0, 0, 255),         # Blue
    'Excavator_Crawler': (0, 128, 0),      # Green
    'Loader': (255, 255, 0),               # Yellow
    'Forklift': (255, 165, 0),             # Orange
    'ConcreteMixerTruck': (255, 0, 0),     # Red
    'Bulldozer': (128, 128, 128),          # Grey
    'DrillingMachine': (255, 20, 147),     # DeepPink
    'PileDriver': (0, 255, 255),           # Cyan
    'CargoTruck_1t_under': (128, 0, 0),    # Maroon
    'CargoTruck_5t_under': (0, 128, 128),  # Teal
    'CargoTruck_25t_under': (0, 0, 128),   # Navy
    'CargoTruck_25t_over': (128, 0, 128)   # Purple
}


# [ 중장비 탐지 함수 ]
# 특정 영역을 기준으로 중장비의 출입을 탐지
he_event_recorded = {}  # track_id: "입차" or "출차"

def detect_he(image_bytes):
    """중장비 탐지 및 OCR을 수행하는 함수"""
    print("AI: 중장비 감지 모듈 호출")

    global heavy_equipment_ocr_attempts, last_ocr_call_ts, ocr_backoff_until, he_frame_counter
    he_frame_counter += 1

    image = Image.open(io.BytesIO(image_bytes))
    frame = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

    # 1) HE 먼저 탐지
    results = he_model.track(frame, persist=True, conf=0.25, iou=0.5, max_det=30, verbose=False)
    detections = []
    violations_to_record = []

    if not results or results[0].boxes.id is None or len(results[0].boxes.id) == 0:
        # HE가 없으면 OCR도 호출하지 않음
        return [], []

    # HE 박스/트랙 모으기
    he_items = []
    names = results[0].names
    for box, track_id, cls in zip(results[0].boxes.xyxy.cpu(),
                                  results[0].boxes.id.cpu(),
                                  results[0].boxes.cls.cpu()):
        tid = int(track_id.item())
        class_name = names[int(cls.item())]
        he_box = list(map(int, box))
        he_items.append((he_box, tid, class_name))

    # 2) OCR 호출 조건 판단 (쿨다운/스트라이드/백오프/번호판 미확정 트랙 존재 여부)
    need_ocr = any(heavy_equipment_ocr_attempts.get(tid, 0) < OCR_RETRY_THRESHOLD for _, tid, _ in he_items)
    ocr_results = []
    now = time.time()
    if need_ocr and now >= ocr_backoff_until \
       and (now - last_ocr_call_ts) >= OCR_COOLDOWN_SEC \
       and (he_frame_counter % FRAME_STRIDE_FOR_OCR == 0):
        

        h, w = frame.shape[:2]
        target_w = 1920
        scale = 1.0
        ocr_src = frame
        if w > target_w:
            scale = target_w / float(w)
            ocr_src = cv2.resize(frame, (int(w*scale), int(h*scale)), interpolation=cv2.INTER_AREA)

        ocr_results = call_hyperclova_ocr(ocr_src)
        last_ocr_call_ts = now

        # 좌표 원복
        if scale != 1.0:
            inv = 1.0 / scale
            for r in ocr_results:
                x1, y1, x2, y2 = r['box']
                r['box'] = [int(round(x1*inv)), int(round(y1*inv)),
                            int(round(x2*inv)), int(round(y2*inv))]


    # 3) HE 박스 - OCR 텍스트 매칭 (확장 박스 + 중심점)
    H_EXPAND = 0.12           # 박스 확장 비율 
    ABS_EXPAND_MIN = 12       # 최소 12px은 확장
    h, w = frame.shape[:2]

    for he_box, track_id, class_name in he_items:
        he_last_seen[track_id] = now
        x1_he, y1_he, x2_he, y2_he = he_box
        bw, bh = (x2_he - x1_he), (y2_he - y1_he)

        # 확장 박스 계산
        mx = max(int(bw * H_EXPAND), ABS_EXPAND_MIN)
        my = max(int(bh * H_EXPAND), ABS_EXPAND_MIN)

        ex1 = max(0, x1_he - mx)
        ey1 = max(0, y1_he - my)
        ex2 = min(w - 1, x2_he + mx)
        ey2 = min(h - 1, y2_he + my)

        license_plate = None
        best_conf = -1.0

        # OCR 결과가 있을 때만 매칭 시도
        for o in ocr_results:
            x1o, y1o, x2o, y2o = o['box']
            cx = (x1o + x2o) / 2.0
            cy = (y1o + y2o) / 2.0

            if ex1 < cx < ex2 and ey1 < cy < ey2:
                conf = float(o.get('confidence', 0.5))
                # (선택) 번호판 형태 간단 필터를 넣고 싶으면 여기에서 regex로 가점/감점
                if conf > best_conf:
                    best_conf = conf
                    license_plate = o['text']

        # 4) OCR 재시도 관리
        if license_plate:
            print(f"  [HE] OCR 매칭 성공! 번호: {license_plate}")
            heavy_equipment_ocr_attempts[track_id] = 0
        else:
            current_attempts = heavy_equipment_ocr_attempts.get(track_id, 0) + 1
            heavy_equipment_ocr_attempts[track_id] = current_attempts
            print(f"  [HE] OCR 매칭 실패. (ID: {track_id}, 시도: {current_attempts}/{OCR_RETRY_THRESHOLD})")
            
            if current_attempts >= OCR_RETRY_THRESHOLD:
                print(f"  [HE] OCR 재시도 임계값 도달. ID: {track_id}를 '인식 오류'로 기록합니다.")
                license_plate = "인식 오류"
                heavy_equipment_ocr_attempts[track_id] = 0

        # 5) 결과 정리
        if license_plate:
            access_status = get_access_status(track_id, y1_he, y2_he)

            last_recorded_status = he_event_recorded.get(track_id)

            # 새로운 입/출차 이벤트인지 확인
            # 이전에 기록된 상태와 현재 상태가 다를 때만 기록함
            if last_recorded_status != access_status:
                print(f"✅ 중장비 '{access_status}' 이벤트 발생! (ID: {track_id}, 번호: {license_plate}) 기록을 준비합니다.")
                he_event_recorded[track_id] = access_status # 현재 상태를 "기록된 상태"로 업데이트

                # violations_to_record 에 추가하여 Spring Boot로 전송
                violations_to_record.append({
                    'track_id': track_id,
                    'info': {'heType': class_name, 'heNumber': license_plate, 'access': access_status},
                    'image': Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)),
                    'detections': he_items.copy() # 현재 프레임의 HE 탐지 결과 전달
                })

            detections.append({
                'box': he_box,
                'label': f"{class_name} (ID: {track_id})",
                'heType': class_name,
                'heNumber': license_plate,
                'access': access_status,
                'track_id': track_id,
                'source': 'he',
                'kind': 'he'
            })
           
            print(f"✅ 중장비 탐지 성공! (ID: {track_id}, 번호: {license_plate}, 입출입: {access_status})")

    return detections, violations_to_record


# [ Track ID 병합 함수 ]
def _iou(b1, b2):
    x1 = max(b1[0], b2[0]); y1 = max(b1[1], b2[1])
    x2 = min(b1[2], b2[2]); y2 = min(b1[3], b2[3])
    iw = max(0, x2 - x1); ih = max(0, y2 - y1)
    inter = iw * ih
    if inter <= 0:
        return 0.0
    a1 = (b1[2]-b1[0]) * (b1[3]-b1[1])
    a2 = (b2[2]-b2[0]) * (b2[3]-b2[1])
    return inter / max(1.0, float(a1 + a2 - inter))

def merge_and_dedupe(all_dets, iou_thr=0.55):
    acc_persons = []
    other_persons = []
    he_list = []
    gear_list = []

    for d in all_dets:
        kind = d.get("kind")
        if kind == "he" or ("heType" in d):
            he_list.append(d)
        elif kind == "gear":
            gear_list.append(d)  # 장비 박스 보존
        elif kind == "person":
            if d.get("source") == "acc":
                acc_persons.append(d)
            else:
                other_persons.append(d)

    merged = []

    # 1) ACC 사람 우선
    for p in acc_persons:
        merged.append(p.copy())

    # 2) PPE 사람을 ACC와 IoU로 병합
    for q in other_persons:
        qbox = q.get("box")
        qtid = q.get("track_id")
        if not qbox:
            continue

        best_iou, best_idx = 0.0, -1
        for i, m in enumerate(merged):
            if m.get("kind") != "person":
                continue
            mbox = m.get("box")
            if not mbox:
                continue
            # 같은 track_id 인 경우, 바로 매칭
            if qtid is not None and m.get("track_id") == qtid:
                best_iou, best_idx = 1.0, i
                break
            iou = _iou(qbox, mbox)
            if iou > best_iou:
                best_iou, best_idx = iou, i

        if best_iou >= iou_thr and best_idx >= 0:
            m = merged[best_idx]
            ss = set(m.get("safety_status", [])) | set(q.get("safety_status", []))
            if ss:
                m["safety_status"] = list(ss)
            m["is_falling"] = bool(m.get("is_falling")) or bool(q.get("is_falling"))
            if (m.get("source") != "acc") and q.get("keypoints"):
                m["keypoints"] = q["keypoints"]
            merged[best_idx] = m
        else:
            merged.append(q.copy())

    # 3) HE, GEAR 그대로 덧붙이기 
    # gear 를 마지막에 두면 사람 박스 위에 잘 보임
    merged.extend(he_list)
    merged.extend(gear_list)

    return merged


# [ HyperCLOVA OCR API 호출 함수 ]
# 바운딩 박스 잘라서 해당 영역에 HyperCLOVA OCR API 을 호출하여 번호판 탐지
def call_hyperclova_ocr(image):
    """HyperCLOVA OCR API를 호출하여 번호판을 탐지하는 함수"""
    global ocr_backoff_until

    # 1. NCP HyperClova OCR API 키 및 URL 설정
    if not OCR_API_URL or not OCR_SECRET_KEY:
        print("❌ OCR 설정 누락(HYPERCLOVA_OCR_URL / HYPERCLOVA_OCR_SECRET)")
        ocr_backoff_until = time.time() + 10
        return []    
    

    # 2. 이미지를 Base64로 인코딩
    image_pil = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    img_byte_arr = io.BytesIO()
    image_pil.save(img_byte_arr, format='JPEG')
    img_base64 = base64.b64encode(img_byte_arr.getvalue()).decode('utf-8')

    # 3. API 요청 바디 생성
    request_body = {
        "version": "V1",
        "requestId": "unique-request-id",
        "timestamp": int(round(time.time() * 1000)),
        "images": [
            {
                "format": "jpeg",
                "name": "image_name",
                "data": img_base64
            }
        ]
    }
    
    headers = {
        "X-OCR-SECRET": OCR_SECRET_KEY,
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(
            OCR_API_URL, 
            headers=headers, 
            json=request_body, 
            timeout=(1.0, 2.5), 
            allow_redirects=False
        )
        response.raise_for_status()     # HTTP 오류가 발생하면 예외 발생
        result = response.json()
        
        # 4. API 응답에서 번호판 텍스트 추출
        ocr_results = []
        for image_result in result.get('images', []):
            for field in image_result.get('fields', []):
                
                # 크래시 / 끊김 방지 안전장치
                poly = field.get('boundingPoly', {})
                vertices = poly.get('vertices') or []
                if len(vertices) < 4:
                    continue

                # API 응답에서 텍스트와 꼭지점(vertex) 좌표를 추출
                vertices = field['boundingPoly']['vertices']
                
                # 꼭지점 좌표들로부터 사각 바운딩 박스(x1, y1, x2, y2)를 계산
                x_coords = [v['x'] for v in vertices]
                y_coords = [v['y'] for v in vertices]
                box = [min(x_coords), min(y_coords), max(x_coords), max(y_coords)]
                conf = field.get('inferConfidence', 0.5)
                try:
                    conf = float(conf)
                except Exception:
                    conf = 0.5
                
                # 텍스트와 계산된 박스를 딕셔너리로 묶어 리스트에 추가
                ocr_results.append({
                    'text': field['inferText'],
                    'box': box,
                    'confidence': conf
                })
        
        return ocr_results # 최종적으로 [{'text': '텍스트', 'box': [x1,y1,x2,y2]}, ...] 형태의 리스트를 반환
            
    except requests.exceptions.RequestException as e:
        print(f"❌ OCR API 호출 실패: {e}")
        # ✅ 실패 시 10초 백오프
        ocr_backoff_until = time.time() + 10
        return [] # 실패 시 빈 리스트를 반환
    except Exception as e:
        print(f"❌ OCR 응답 처리 실패: {e}")
        ocr_backoff_until = time.time() + 10
        return [] # 실패 시 빈 리스트를 반환
    finally:
        eventlet.sleep(0)   # 긴 I/O 뒤엔 반드시 양보해서 소켓 하트비트 살리기


# [ 중장비 입출입 판별 함수 ]
# y축 위치의 변화를 기준으로 판단하여, 위로 올라가면 '입차'(in), 아래로 내려가면 '출차'(out)
heavy_equipment_history = {}
Y_DELTA_MIN = 3             # 최소 픽셀 임계
Y_DELTA_MAX = 24            # 과도한 점프 제한 
Y_DELTA_PCT = 0.018          # 박스 높이의 1.8% 

def get_access_status(track_id, current_y1, current_y2):
    """트래킹 ID를 기반으로 입출입 상태를 판별하는 함수"""
    global heavy_equipment_history
    current_y_center = (current_y1 + current_y2) / 2.0
    box_h = max(1, current_y2 - current_y1)
    local_thr = max(Y_DELTA_MIN, min(Y_DELTA_MAX, int(box_h * Y_DELTA_PCT)))

    hist = heavy_equipment_history.get(track_id)
    now_ts = time.time()

    if not hist:
        heavy_equipment_history[track_id] = {'last_y_center': current_y_center, 'last_status': '입차', 'ts': now_ts}
        return '입차' # 초기 진입은 '입차'

    dy = current_y_center - hist['last_y_center']
    # 임계 이하 움직임은 이전 상태 유지, 넘으면 방향으로 판정
    status = hist['last_status'] if abs(dy) < local_thr else ('입차' if dy < 0 else '출차')


    hist['last_y_center'] = current_y_center
    hist['last_status'] = status
    hist['ts'] = now_ts 
    return status


# =================================================================
#           3. Spring Boot 및 NCP Object Storage 연동 설정
# =================================================================
SPRING_BOOT_API_URL = os.getenv("SPRING_BOOT_API_URL", "http://10.1.20.7:8090/web/aiapi")
NCP_ENDPOINT_URL = os.getenv("NCP_ENDPOINT_URL", "https://kr.object.ncloudstorage.com")
NCP_BUCKET_NAME = os.getenv("NCP_BUCKET_NAME", "aivis-obj-storage")
NCP_ACCESS_KEY = os.getenv("NCP_ACCESS_KEY")      
NCP_SECRET_KEY = os.getenv("NCP_SECRET_KEY")      
NCP_REGION = os.getenv("NCP_REGION", "kr-standard")


# 필수 환경 변수 확인 
missing = [k for k, v in {
    "NCP_ACCESS_KEY": NCP_ACCESS_KEY,
    "NCP_SECRET_KEY": NCP_SECRET_KEY,
}.items() if not v]
if missing:
    raise RuntimeError(f"Missing required env vars: {', '.join(missing)}")
    

# NCP Object Storage 클라이언트 (Boto3)
s3_client = boto3.client(
    's3',
    endpoint_url=NCP_ENDPOINT_URL,
    aws_access_key_id=NCP_ACCESS_KEY,
    aws_secret_access_key=NCP_SECRET_KEY,
    region_name=NCP_REGION
)


# HyperCLOVA OCR 
OCR_API_URL    = os.getenv("HYPERCLOVA_OCR_URL")    
OCR_SECRET_KEY = os.getenv("HYPERCLOVA_OCR_SECRET")


# 추적된 객체별로 마지막 기록 시간을 저장하여 중복 기록 방지
last_recorded_times = {}
RECORD_COOLDOWN = 300            # 초 단위, 동일 객체에 대해 20초에 한 번만 기록 전송


# =================================================================
# 4. WebSocket 이벤트 핸들러
# =================================================================

client_main_device: dict[str, Union[int, None]] = {}

# [ 클라이언트(React) 연결 성공 시, 실행 함수 ]
@socketio.on('connect')
def on_connect():
    client_main_device[request.sid] = None
    print(f"✅ Client connected: {request.sid}")


# [ 클라이언트(React) 연결 종료 시, 실행 함수]
@socketio.on('disconnect')
def on_disconnect():
    sid = request.sid
    client_main_device.pop(sid, None)

    stop_video_stream(owner_sid=sid)

    print(f"❌ Client disconnected: {sid}")


# [ 메인 화면 장비 설정 이벤트 핸들러 ]
@socketio.on('set_main_device')
def handle_set_main_device(data):
    raw = data.get('deviceId', None)
    try:
        device_id = int(raw)
    except (TypeError, ValueError):
        emit('server_error', {'type': 'missing_deviceId', 'sid': request.sid}, to=request.sid)
        return

    client_main_device[request.sid] = device_id
    print(f"📺 Main device set to: {device_id} (sid={request.sid})")

    emit('main_device_set', {'ok': True, 'deviceId': device_id}, to=request.sid)


# [ 전역 탐지 기능 On/Off 토글 이벤트 핸들러 ]
@socketio.on('toggle_global_detection')
def handle_toggle_global_detection(data):
    """React 하단 버튼으로 전역 탐지 기능 On/Off 시 호출될 함수"""
    global global_toggle_states
    detection_type = data.get('detectionType')              # 'ppe', 'acc', 'he'
    is_active = data.get('isActive')

    if detection_type in global_toggle_states and isinstance(is_active, bool):
        global_toggle_states[detection_type] = is_active
        print(f"🌐 Global toggles updated: {global_toggle_states}")
        # 클라이언트에 상태가 업데이트 알림 (선택 사항)
        emit('global_state_updated', global_toggle_states, broadcast=True)
        eventlet.sleep(0)


# [ 동영상 처리 스레드를 안전하게 종료하는 함수 ]
def stop_video_stream(owner_sid=None):
    """동영상 처리 스레드를 안전하게 종료하는 함수"""
    global current_video_stream, thread_for_video_processing, current_stream_owner_sid

    # 소유자 확인하여 owner_sid 와 현재 소유자와 다르면 종료하지 않음
    if owner_sid is not None and current_stream_owner_sid != owner_sid:
        return
    
    if current_video_stream:
        print("동영상 스트림 중지 요청")
        try:
            current_video_stream.release()
        except Exception:
            pass
        current_video_stream = None          # 스레드 종료를 위해 None 으로 설정

    # None 할당으로 루프 종료 유도
    thread_for_video_processing = None
    current_stream_owner_sid = None


# [ React로부터 영상 분석 요청 시, 실행 함수]
@socketio.on('start_analysis')
def handle_start_analysis(data):
    """영상 분석 시작 요청을 처리하는 함수 (웹캠 / 동영상 모드)"""
    mode = data.get('mode')                     # 'webcam' 또는 '파일경로'
    device_id = data.get('deviceId') 
    sid = request.sid

    if device_id is not None:
        try:
            client_main_device[sid] = int(device_id)
        except Exception:
            pass


    # 새로운 분석 시작 전, 기존 스트림 처리 중지
    stop_video_stream(owner_sid=sid)

    if mode and mode != 'webcam':               # 동영상 모드 (파일 경로 전달)
        print(f"동영상 모드 시작 요청: {mode} (Device: {device_id}, sid={sid})")
        start_video_processing(mode, device_id, sid)  

    elif mode == 'webcam':                      # 웹캠 모드
        print("웹캠 모드 준비 완료.")
        emit('analysis_started', {'status': 'webcam_ready'}, to=sid)


# [ React로부터 이미지 분석 요청 시, 실행 함수 ]
@socketio.on('image_analysis_request')
def handle_image_analysis(data):
    """React에서 웹캠 이미지 프레임을 처리하는 함수"""
    if not isinstance(data, dict):
        print("⚠️ invalid payload:", type(data))
        return

    image_data_url = data.get('image')
    device_id = data.get('deviceId')

    sid = request.sid
    try:
        device_id_int = int(device_id)
    except (TypeError, ValueError):
        print("⚠️ invalid deviceId:", device_id)
        return

    # 해당 세션이 현재 선택한 메인 디바이스
    selected = client_main_device.get(sid)
    print(f"[image_analysis_request] sid={sid}, device_id={device_id_int}, selected={selected}, toggles={global_toggle_states}")

    # 기능 전원이 전부 OFF면 스킵
    if not any(global_toggle_states.values()):
        print("↩️  skip: all toggles off")
        return

    # 세션이 선택한 메인 디바이스가 아니면 스킵
    try:
        if selected is None or device_id_int != int(selected):
            print("↩️  skip: not this sid's main device")
            return
    except Exception:
        print("↩️  skip: invalid selected value:", selected)
        return

    # 이미지 데이터 검증
    if not image_data_url or "," not in image_data_url:
        print("↩️  skip: bad image data")
        return

    # 서버 측 스로틀 (중복/과속 전송 방지) 
    key = (sid, device_id_int)
    now = time.time()

    # 1) 너무 빠른 중복 프레임 드롭
    if now - last_frame_ts.get(key, 0) < MIN_INTERVAL:
        return
    last_frame_ts[key] = now

    # 2) 이전 프레임 처리 중이면 드롭 (동시 처리 방지)
    if key in processing_inflight:
        return
    processing_inflight.add(key)


    try:
        header, encoded = image_data_url.split(",", 1)
        image_bytes = base64.b64decode(encoded)
        original_image = Image.open(io.BytesIO(image_bytes))

        all_detections = []

        start_ts = time.time()

        jobs = []
        types = []
        
        if global_toggle_states.get('ppe'):
            jobs.append(GREEN_POOL.spawn(detect_ppe, image_bytes))
            types.append('ppe')
        if global_toggle_states.get('acc'):
            jobs.append(GREEN_POOL.spawn(detect_acc, image_bytes))
            types.append('acc')
        if global_toggle_states.get('he'):
            jobs.append(GREEN_POOL.spawn(detect_he, image_bytes))
            types.append('he')

        all_detections = []
        # 병렬로 날려둔 작업을 순서대로 회수(wait)
        for job, typ in zip(jobs, types):
            d, v = job.wait()  # 여기서 각 모델 결과 수집
            all_detections.extend(d)
            socketio.start_background_task(process_violations, typ, v, original_image.copy(), device_id) 


        merged = merge_and_dedupe(all_detections)
        ai_detections = _to_py(merged)


        # 서버가 권장하는 다음 전송 간격 힌트 (밀리초)
        proc_ms = int((time.time() - start_ts) * 1000)
        next_delay_ms = max(
            int(1000.0 / SERVER_TARGET_FPS),          # 목표 FPS
            int(MIN_INTERVAL * 1000),                 # 서버 쓰로틀
            int(proc_ms * 0.6)                        # 처리시간 기반 (약간 여유)
        )

        emit('analysis_result', 
             {'detections': ai_detections, 
              'deviceId': int(device_id),
              'nextDelayMs': next_delay_ms
              }, to=sid)


    except Exception as e:
        print(f"이미지 분석 중 오류 발생: {e}")
    finally:
        processing_inflight.discard(key)
        try:
            eventlet.sleep(0)
        except Exception:
            pass


# [ 동영상의 AI 분석을 수행하는 스레드 시작 함수]
def start_video_processing(video_path, device_id, sid):
    """동영상을 읽고 AI 분석을 수행하는 스레드를 시작하는 함수"""
    global thread_for_video_processing, current_stream_owner_sid

    # 다른 세션이 소유 중이면 그 세션 스트림만 종료
    if current_stream_owner_sid and current_stream_owner_sid != sid:
        stop_video_stream(owner_sid=current_stream_owner_sid)

    current_stream_owner_sid = sid
    thread_for_video_processing = eventlet.spawn(process_video_stream, video_path, device_id, sid)


# [ 동영상의 AI 분석을 수행하여 React로 프레임을 보내는 함수 ]
def process_video_stream(video_path, device_id, sid):
    """동영상을 읽고 AI 분석을 수행하여 React로 프레임을 보내는 함수"""
    global current_video_stream, current_stream_owner_sid
    cap = cv2.VideoCapture(video_path)
    current_video_stream = cap

    try:
        while current_video_stream is cap:
            
            # 소유자 확인 후, 소유자가 아니면 종료
            if current_stream_owner_sid != sid:
                break

            # 세션별 현재 선택된 메인 디바이스 확인
            selected = client_main_device.get(sid)

            # AI 기능 상태가 OFF이거나, 이 세션의 메인 디바이스가 아니면 분석 스킵 (프레임은 소모)
            if (not any(global_toggle_states.values())) or (selected is None) or (int(device_id) != int(selected)):
                ret, _ = cap.read()
                if not ret:
                    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                eventlet.sleep(0.05)    # 하트 비트 유지
                continue

            # 프레임 읽기
            ret, frame = cap.read()
            if not ret:
                print(f"동영상 스트림 끝 ({device_id}), 재시작합니다.")
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                eventlet.sleep(0)
                continue

            try:
                # OpenCV 프레임(numpy.ndarray)을 PIL Image로 변환
                pil_img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

                # PIL Image를 메모리 버퍼로 변환하여 AI 함수에 전달
                buf = io.BytesIO()
                pil_img.save(buf, format='JPEG')
                image_bytes = buf.getvalue()

                all_detections = []

                # [ 활성화된 기능에 대해서만 AI 분석 수행 ]
                start_ts = time.time()

                jobs = []
                types = []
                if global_toggle_states.get('ppe'):
                    jobs.append(GREEN_POOL.spawn(detect_ppe, image_bytes))
                    types.append('ppe')
                if global_toggle_states.get('acc'):
                    jobs.append(GREEN_POOL.spawn(detect_acc, image_bytes))
                    types.append('acc')
                if global_toggle_states.get('he'):
                    jobs.append(GREEN_POOL.spawn(detect_he, image_bytes))
                    types.append('he')

                all_detections = []
                for job, typ in zip(jobs, types):
                    d, v = job.wait()
                    all_detections.extend(d)
                    socketio.start_background_task(process_violations, typ, v, pil_img.copy(), device_id)


                merged = merge_and_dedupe(all_detections)
                ai_detections = _to_py(merged)

                proc_ms = int((time.time() - start_ts) * 1000)
                next_delay_ms = max(
                    int(1000.0 / SERVER_TARGET_FPS),
                    int(MIN_INTERVAL * 1000),
                    int(proc_ms * 0.6)
                )

                socketio.emit('analysis_result', 
                              {'detections': ai_detections, 
                               'deviceId': int(device_id),
                               'nextDelayMs': next_delay_ms
                               }, to=sid)

            except Exception as e:
                print(f"동영상 처리 중 오류 발생: {e}")
            finally:
                eventlet.sleep(0)  # 핑/퐁 유지

    finally:
        cap.release()
        if current_video_stream is cap:
            current_video_stream = None
        if current_stream_owner_sid == sid:
            current_stream_owner_sid = None
        print("동영상 처리 스레드 종료")



# =================================================================
# 5. Spring Boot API 연동 및 Object Storage 업로드 함수
# =================================================================

# [ 위반 기록 처리 함수 ]
def process_violations(detection_type, violations_to_record, original_image, device_id):
    """탐지된 위반 사항을 쿨다운 적용하여 기록하는 함수"""
    global last_recorded_times
    device_id = int(device_id)
    current_time = time.time()
    for violation in violations_to_record:
        # ㅇ track_id가 없는 경우 (e.g. OCR 실패)를 대비해 기본값 0 사용
        track_id = violation.get('track_id', 0)
        
        # ㅇ 중복 기록 방지를 위해 고유 키 생성 (탐지타입 + 트랙ID)
        record_key = f"{detection_type}-device-{device_id}-track-{track_id}"
        last_time = last_recorded_times.get(record_key, 0)

        if current_time - last_time > RECORD_COOLDOWN:
            last_recorded_times[record_key] = current_time
            info = {}
            if detection_type in ('ppe', 'acc'):
                info = {'labels': violation['labels']}
            elif detection_type == 'he':
                info = violation['info']
            
            # record_violation 호출 시에는 전체 탐지 결과를 넘겨줌
            record_violation(detection_type, info, original_image, track_id, violation['detections'], device_id)


# [ NCP 오브젝트 스토리지에 업로드 ]
def upload_to_ncp_storage(image_pil, filename, detection_type):
    try:
        in_mem_file = io.BytesIO()
        image_pil.save(in_mem_file, format='JPEG')
        in_mem_file.seek(0)


        # 한국 시간(KST) 기준 날짜
        now_kst = datetime.now(ZoneInfo("Asia/Seoul"))
        date_path = now_kst.strftime("%Y%m%d")

        # Key 구성: records/탐지유형/20250808/파일명.jpg
        key = f"records/{detection_type}/{date_path}/{filename}"

        s3_client.upload_fileobj(
            in_mem_file,
            NCP_BUCKET_NAME,
            key,
            ExtraArgs={'ACL': 'public-read'}
        )
        print(f"  📤 파일 업로드 성공: {key}")
        return f"{NCP_ENDPOINT_URL}/{NCP_BUCKET_NAME}/{key}"
    except Exception as e:
        print(f"  ❌ 파일 업로드 실패: {e}")
        return None
    
    finally:
        # 업로드 후 양보
        try:
            eventlet.sleep(0)
        except Exception:
            pass


def record_violation(detection_type, violation_info, original_image, track_id, detections, device_id):
    """AI 탐지 위반 사항을 Spring Boot 서버로 전송하는 함수"""
    print(f"🚨 위반 감지 (ID: {track_id}): {detection_type}. Spring Boot 서버로 기록을 전송합니다")
    
    # 한국 시간(KST) 직접 가져오기
    now_kst = datetime.now(ZoneInfo("Asia/Seoul"))


    # ㅇ 이미지 URL 및 파일명 생성
    type_code_map = {"ppe": "01", "acc": "02", "he": "03"}
    type_code = type_code_map.get(detection_type, "00")
    timestamp = now_kst.strftime("%Y%m%d_%H%M%S")
    capture_filename = f"{type_code}_capture_{timestamp}.jpg"
    detection_filename = f"{type_code}_detect_{timestamp}.jpg"

    # ㅇ 탐지 결과 이미지 생성
    detection_image = original_image.copy()
    draw = ImageDraw.Draw(detection_image)

    # ㅇ 폰트 종류와 크기 설정
    font = load_korean_font(size=24)

    HIGHLIGHT_COLOR = (255, 165, 0)   # orange, 기록 대상 객체 색상
    VIOLATOR_COLOR = (255, 0, 0)      # red, 위반자 객체 색상
    NORMAL_COLOR = (0, 0, 255)        # blue, 정상 객체 색상


    # 바운딩 박스 색상 지정 로직
    for det in detections:
        box = det['box']
        label = det['label']

        # 1. 기본 색상 결정
        color = NORMAL_COLOR # 기본값은 파란색(정상)
        is_violator = False
        if 'safety_status' in det and any(status in SAFETY_LABELS['unwear'] for status in det['safety_status']):
            is_violator = True
        elif 'is_falling' in det and det.get('is_falling'):
            is_violator = True
        
        if is_violator:
            color = VIOLATOR_COLOR # 위반자면 빨간색


        # 2. 중장비는 고유 색상 규칙 적용
        if 'heType' in det:
            he_type = det.get('heType')
            color = HE_COLOR_MAP.get(he_type, VIOLATOR_COLOR)
        

        # 3. 현재 기록 대상이면 주황색으로 강조
        if det.get('track_id') == track_id:
            color = HIGHLIGHT_COLOR


        # 4. 최종 결정된 색상으로 그리기 실행
        draw.rectangle(box, outline=color, width=4)                     # 선 굵기 4
        draw.text((box[0], box[1] - 28), label, fill=color, font=font)  # y 위치와 폰트 적용
        

        # 5. 포즈 키포인트 시각화 (사고 감지 시)
        if detection_type == 'acc':
            kpts = det.get('keypoints', [])
            for kpt in kpts:
                draw.ellipse((kpt[0]-3, kpt[1]-3, kpt[0]+3, kpt[1]+3), fill=color, outline=color)


    # Object Storage에 이미지 업로드
    original_img_url = upload_to_ncp_storage(original_image, capture_filename, detection_type)
    detect_img_url = upload_to_ncp_storage(detection_image, detection_filename, detection_type)
    if not original_img_url or not detect_img_url:
        print("  ❌ 이미지 URL 생성 실패. 기록 전송을 중단합니다.")
        return


    # Spring Boot API로 보낼 데이터 준비
    common_data = {
        "deviceId": device_id,
        "regDate": now_kst.strftime("%Y-%m-%d %H:%M:%S")
    }
    api_endpoint = ""
    record_data = {}

    if detection_type == 'ppe':
        api_endpoint = "/ppe-records"

        raw = violation_info.get('labels', [])

        try:
            import numpy as _np
            if isinstance(raw, _np.ndarray):
                raw = raw.tolist()
        except Exception:
            pass
        if isinstance(raw, (set, tuple)):
            raw = list(raw)

        labels = [str(x) for x in raw]

        # 1. 미착용 항목을 저장할 리스트 생성
        unworn_items = []
        
        # 2. violation_info['labels']를 확인하여 미착용 항목 추가
        if 'Safety Helmet unwear' in labels:
            unworn_items.append("안전모 미착용")
        if 'Safety Hook unwear' in labels:
            unworn_items.append("안전고리 미결착")
        if 'Safety Belt unwear' in labels:
            unworn_items.append("안전벨트 미착용")
        if 'Safety Shoes unwear' in labels:
            unworn_items.append("안전화 미착용")
            
        # 3. 미착용 항목 리스트를 문자열로 변환 (예: "안전모 미착용, 안전벨트 미착용")
        violation_details = ", ".join(unworn_items)
        
        # 4. 최종 content 문자열 생성
        if violation_details:
            # content = f"{now_kst.strftime('%Y년 %m월 %d일 %H:%M:%S')}\n작업자(ID: {track_id})의 {violation_details}이(가) 감지되었습니다."
            content = f"작업자(ID: {track_id})의 {violation_details}이(가) 감지되었습니다."
        else:
            # 예외 상황의 경우, 다음 문장을 출력함
            # content = f"{now_kst.strftime('%Y년 %m월 %d일 %H:%M:%S')}\n작업자(ID: {track_id})의 안전장비 미착용이 감지되었습니다."
            content = f"작업자(ID: {track_id})의 안전장비 미착용이 감지되었습니다."

        record_data = {
            "deviceId": int(common_data["deviceId"]),
            "originalImg": original_img_url,
            "detectImg": detect_img_url,
            "content": content,
            "helmetOff": 1 if 'Safety Helmet unwear' in labels else 0,
            "hookOff": 1 if 'Safety Hook unwear' in labels else 0,
            "beltOff": 1 if 'Safety Belt unwear' in labels else 0,
            "shoesOff": 1 if 'Safety Shoes unwear' in labels else 0,
            "regDate": common_data["regDate"]
        }

    elif detection_type == 'acc':
        api_endpoint = "/acc-records"
        # content = f"{now_kst.strftime('%Y년 %m월 %d일 %H:%M:%S')}\n사고 상황으로 의심되는 작업자(ID: {track_id})가 감지되었습니다."
        content = f"작업자(ID: {track_id})의 사고 상황(낙상)으로 의심되는 상황이 감지되었습니다."
        record_data = {
            "deviceId": int(common_data["deviceId"]),
            "originalImg": original_img_url,
            "detectImg": detect_img_url,
            "content": content,
            "regDate": common_data["regDate"]
        }

    elif detection_type == 'he':
        api_endpoint = "/he-records"
        heType = violation_info.get('heType')
        heNumber = violation_info.get('heNumber')
        access = violation_info.get('access')
       
        record_data = {
            "deviceId": int(common_data["deviceId"]),
            "heType": heType,
            "heNumber": heNumber,
            "access": access,
            "regDate": common_data["regDate"],
            "originalImg": original_img_url,
            "detectImg": detect_img_url,
        }

    # API 호출   
    if api_endpoint:
        try:
            full_api_url = SPRING_BOOT_API_URL + api_endpoint

            payload = _to_py(record_data)                       # numpy 제거
            if 'deviceId' in payload:
                payload['deviceId'] = int(payload['deviceId'])  # INT 강제

            headers = {'Content-Type': 'application/json; charset=UTF-8'}
            response = requests.post(full_api_url, json=payload, headers=headers)

            print(f"[POST] {full_api_url} -> {response.status_code}")
            print(f"[REQ ] {payload}")
            print(f"[RESP] {response.text}")

            if 200 <= response.status_code < 300:
                print(f"✅ {detection_type} 기록 전송 성공!")
                socketio.emit('new_record_added', {'type': detection_type})
            else:
                print(f"❌ {detection_type} 기록 전송 실패: {response.status_code}")
        except Exception as e:
            print(f"API 호출 중 오류 발생: {e}")

        finally:
            # 네트워크 I/O 후 양보
            try:
                eventlet.sleep(0)
            except Exception:
                pass


# =================================================================
# 6. Spring Boot API 연동 및 Object Storage 업로드 함수
# =================================================================

# [ 정리 루프 함수 ]
def prune_caches_loop():
    while True:
        try:
            now = time.time()

            # 1) 기록 쿨다운 맵 
            # last_recorded_times: key -> ts
            stale = [k for k, ts in last_recorded_times.items() if now - ts > COOLDOWN_TTL_SEC]
            for k in stale:
                last_recorded_times.pop(k, None)

            # 2) 사고 추적 상태 
            # fall_status: tid -> {count, ts}
            stale_tids = [tid for tid, v in fall_status.items() if now - v.get('ts', now) > TRACK_TTL_SEC]
            for tid in stale_tids:
                fall_status.pop(tid, None)

            # 3) 중장비 방향 판단 히스토리 
            # heavy_equipment_history: tid -> {..., ts}
            stale_tids = [tid for tid, v in heavy_equipment_history.items() if now - v.get('ts', now) > TRACK_TTL_SEC]
            for tid in stale_tids:
                heavy_equipment_history.pop(tid, None)

            # 4) 중장비 OCR 재시도 횟수 
            # heavy_equipment_ocr_attempts, 오래 안 보인 트랙 제거
            stale_tids = [tid for tid, last in he_last_seen.items() if now - last > TRACK_TTL_SEC]
            for tid in stale_tids:
                he_last_seen.pop(tid, None)
                heavy_equipment_ocr_attempts.pop(tid, None)

            # 5) 프레임 스로틀 맵 
            # last_frame_ts: (sid, deviceId) -> ts
            stale_keys = [k for k, ts in last_frame_ts.items() if now - ts > FRAME_TS_TTL_SEC]
            for k in stale_keys:
                last_frame_ts.pop(k, None)

            # 6) 처리중 세트(processing_inflight)
            # 키가 남는 경우를 방지하기 위해 강제 정리
            inflight_stale = {k for k in list(processing_inflight) if now - last_frame_ts.get(k, 0) > 5}
            for k in inflight_stale:
                processing_inflight.discard(k)

        except Exception as e:
            print(f"[cleanup] error: {e}")
        finally:
            eventlet.sleep(CLEANUP_INTERVAL_SEC)



# =================================================================
# 7. 서버 실행
# =================================================================

@app.route("/ping", methods=["GET"])
def ping():
    return "ok", 200

@app.route("/healthz", methods=["GET"])
def healthz():
    return jsonify({"status": "ok"}), 200

if __name__ == '__main__':
    print("AI 서버를 시작합니다 (포트 5000)...")
    socketio.start_background_task(prune_caches_loop)
    socketio.run(app, host='0.0.0.0', port=5000, use_reloader=False, debug=True)
