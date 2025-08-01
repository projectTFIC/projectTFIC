import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
from dotenv import load_dotenv

# 1. 환경설정
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

# 2. Flask 설정
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# 3. GPT 호출 함수
def call_gpt_report(prompt):
    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "너는 건설현장 보고서를 자동으로 작성하는 AI 비서야. "
                    "보고서는 형식에 맞게 간결하고 명확하게 작성해야 하며, "
                    "불필요한 반복이나 모호한 말, 과장된 표현은 절대 사용하지 마. "
                    "사실 기반으로만 서술하고, 각 항목은 핵심만 요약해서 5줄 이내로 작성하도록 해."},
            {"role": "user", "content": prompt}
        ]
    )
    return response.choices[0].message.content

# 4. 프롬프트 템플릿 함수
def make_accident_prompt(acc_summary, period_start, period_end, user_id, extra_note=""):
    return f"""[안전 사고 상세 보고서]
- 보고서 작성자: {user_id}
- 보고 기간: {period_start} ~ {period_end}

1. 사고 개요
{acc_summary}

2. 사고 발생 원인 및 경과
- 각 사고의 구체적 원인, 발생 시간 및 상황, 연관된 작업 및 장비, 작업자 정보 등을 최대한 구체적으로 기술하세요.

3. 즉각 조치사항 및 현장 대응
- 사고 발생 직후 취한 조치, 응급 처치, 현장 격리·통제, 관리자 보고 등 실제 현장 대응 상황을 서술하세요.

4. 재발 방지 및 예방 대책
- 동일 유형 사고 예방을 위한 실질적 교육, 설비 개선, 작업 절차 변경, 추가 안전점검, CCTV 분석 등 실행 가능한 방안을 제시하세요.

5. 참고/특이사항
{extra_note if extra_note else '- 해당 없음'}
"""

def make_entry_prompt(he_summary, period_start, period_end, user_id, extra_note=""):
    return f"""[차량/중장비 입출입 관리 보고서]
- 작성자: {user_id}
- 관리 기간: {period_start} ~ {period_end}

1. 입출입 내역 요약
{he_summary}

2. 출입 통제/관리 현황
- 무단 출입, 등록 외 차량 출입 시도, 비정상 출입 시간 등 이상 징후가 있었는지 상세히 기록하세요.

3. 개선 필요사항 및 현장 피드백
- 출입 관리상 확인된 문제점, 출입 경로 개선안, 안내표지 정비, 추가 출입관리 장치 설치 등 구체적 제안을 작성하세요.

4. 기타/특이사항
{extra_note if extra_note else '- 해당 없음'}
"""

def make_total_prompt(he_summary, acc_summary, ppe_summary, period_start, period_end, user_id, extra_note=""):
    return f"""[현장 통합 종합 보고서]
- 작성자: {user_id}
- 보고 기간: {period_start} ~ {period_end}

1. 차량/중장비 입출입 현황
{he_summary}

2. 안전 사고 발생 내역
{acc_summary}

3. 안전장비(개인보호구) 미착용 감지 내역
{ppe_summary}

4. 종합 평가 및 주요 이슈
- 현장 전반에서 나타난 위험요소, 반복되는 이슈, 관리상의 어려움, 근본적 문제점 등을 구체적으로 서술하세요.

5. 조치 현황 및 예방대책
- 사고/미착용/입출입 문제별로 각 조치 실행 내용, 교육, 시설 보완, 추가 방지대책을 상세히 작성하세요.

6. 참고/특이사항
{extra_note if extra_note else '- 해당 없음'}
"""

# 5. 보고서 생성 엔드포인트
@app.route('/api/report/generate', methods=['POST'])
def generate_report():
    data = request.json
    period_start = data['period_start']
    period_end = data['period_end']
    user_id = data['user_id']
    report_type = data['report_type']
    use_custom_prompt = data.get('use_custom_prompt', False)
    custom_prompt = data.get('custom_prompt', '')
    extra_note = data.get('extra_note', '')

    # 샘플 요약 텍스트 (DB 제거 → 실제 감지 내역은 Spring에서 분석)
    acc_summary = "- 사고 없음 (샘플)"
    he_summary = "- 입출입 없음 (샘플)"
    ppe_summary = "- 미착용 없음 (샘플)"

    if use_custom_prompt and custom_prompt.strip():
        prompt = custom_prompt
    else:
        if report_type == "accident":
            prompt = make_accident_prompt(acc_summary, period_start, period_end, user_id, extra_note)
        elif report_type == "entry":
            prompt = make_entry_prompt(he_summary, period_start, period_end, user_id, extra_note)
        elif report_type == "total":
            prompt = make_total_prompt(he_summary, acc_summary, ppe_summary, period_start, period_end, user_id, extra_note)
        else:
            return jsonify({"error": "Invalid report_type"}), 400
        

    report_html = call_gpt_report(prompt)
    print(f"리턴되는 report_html 값: {report_html}")
    return jsonify({'report_html': report_html})

# 6. 앱 실행
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)