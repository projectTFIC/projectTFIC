import os
import os
import shutil
import pdfkit

def get_wkhtmltopdf_config():
    """
    1순위: 환경변수 WKHTMLTOPDF_PATH
    2순위: 시스템 PATH에서 wkhtmltopdf 자동 탐색 (리눅스/윈도우 공통)
    3순위: OS별 흔한 기본 경로들 시도
    """
    # 1) 환경변수 우선
    env_path = os.getenv("WKHTMLTOPDF_PATH")
    if env_path and os.path.exists(env_path):
        return pdfkit.configuration(wkhtmltopdf=env_path)

    # 2) PATH에서 자동 탐색
    auto = shutil.which("wkhtmltopdf")
    if auto:
        return pdfkit.configuration(wkhtmltopdf=auto)

    # 3) OS별 흔한 기본 경로
    candidates = []
    if os.name == "nt":  # Windows
        candidates += [
            r"C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe",
            r"C:\Program Files (x86)\wkhtmltopdf\bin\wkhtmltopdf.exe",
        ]
    else:  # POSIX (Linux/macOS)
        candidates += [
            "/usr/bin/wkhtmltopdf",
            "/usr/local/bin/wkhtmltopdf",
        ]

    for path in candidates:
        if os.path.exists(path):
            return pdfkit.configuration(wkhtmltopdf=path)

    return None

from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import openai
from dotenv import load_dotenv
import io

# 1. 환경설정
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY", "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")

# 2. Flask 설정
app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# 공통 HTML 템플릿
BASE_HTML = """
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{title}</title>
  <style>
    body {{
      font-family: 'Pretendard', sans-serif;
      line-height: 1.6;
      margin: 20px;
      color: #333;
    }}
    h1, h2, h3 {{
      color: #2c3e50;
      margin-top: 24px;
    }}
    table {{
      border-collapse: collapse;
      width: 100%;
      margin: 15px 0;
    }}
    th, td {{
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }}
    th {{
      background-color: #f2f2f2;
    }}
    pre {{
      background-color: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
    }}
  </style>
</head>
<body>
  {content}
</body>
</html>
"""

def generate_html_report(title, content):
    """공통 HTML 템플릿 생성"""
    return BASE_HTML.format(title=title, content=content)


# 3. GPT 호출 함수
def call_gpt_report(prompt):
  try:
    response = openai.chat.completions.create(
        model="gpt-4o",
        temperature=0.3,  # 창의성 낮춤
        top_p=0.9,
        frequency_penalty=0.5,  # 반복 억제
        presence_penalty=0.5,   # 새로운 내용 억제
        messages=[
            {
                "role": "system",
                "content": (
                    "건설현장 보고서 전문가입니다. 반드시 다음 규칙을 지켜주세요:\n"
                    "1. HTML 형식으로만 출력 (div, h2, h3, p, ul/li 태그 사용)\n"
                    "2. 간결하고 전문적인 문체 사용\n"
                    "3. 원본 데이터를 직접 인용하지 말고 재구성\n"
                    "4. 각 섹션은 3-5줄로 요약"
                )
            },
            {"role": "user", "content": prompt}
        ]
    )
    return response.choices[0].message.content
  except openai.APIError as e:
      # OpenAI API 자체에서 에러가 발생한 경우
      print(f"❌ OpenAI API Error: {e}")
      raise Exception(f"OpenAI API에 문제가 발생했습니다: {e}")
  except Exception as e:
      # 네트워크 문제 등 기타 예외
      print(f"❌ GPT 호출 중 알 수 없는 오류: {e}")
      raise Exception("GPT 모델 호출 중 오류가 발생했습니다.")
  

def validate_response(response, original_summary):
    if original_summary.strip() and original_summary.lower() not in response.lower():
        print("⚠️ 원본 summary가 보고서에 반영되지 않음. 강제 포함.")
        
        # HTML 보고서에 맞게 감싸기
        extra_html = f"""
        <br><br>
        <details style="margin-top:20px;">
          <summary><strong>원본 데이터 보기</strong></summary>
          <pre style="white-space: pre-wrap;">{original_summary}</pre>
        </details>
        """
        return response + extra_html
    
    return response


# 4. 프롬프트 템플릿 함수
def make_accident_prompt(summary, period_start, period_end, user_id, extra_note=""):
    return f"""
다음은 건설현장의 낙상 사고 기록 요약입니다.

- 보고 기간: {period_start} ~ {period_end}
- 작성자: {user_id}
- 요약 데이터:
{summary}

이 데이터를 기반으로 아래 항목에 맞춰 **HTML 형식으로 보고서**를 작성해주세요.

반드시 <h2>, <h3>, <p>, <ul> 등의 HTML 태그를 사용하여 구조화된 문서로 출력해주세요.

예시:
<h2>1. 사고 개요</h2>
<p>내용</p>

<h2>2. 사고 발생 원인 및 경과</h2>
<p>내용</p>

...

<h2>5. 참고/특이사항</h2>
<p>내용</p>


**주의사항**: 반드시 HTML로 출력하며, 문장은 간결하고 명확하게 작성해주세요.
"""


def make_entry_prompt(summary, entry_table_html, period_start, period_end, user_id):
    return f"""
    

      <h3>1. 입출입 내역 요약</h3>
      <p>{summary.replace('<br>', '<br/>')}</p>

      <h3>2. 차량 출입 테이블</h3>
      {entry_table_html}

      <h3>3. 개선사항 및 현장 피드백</h3>
   

      <h3>4. 기타/특이사항</h3>
      
    </body>
    </html>
    """

def make_total_prompt(he_summary, acc_summary, ppe_summary, period_start, period_end, user_id, extra_note=""):
    return f"""
    <html>
    <head> ... </head>
    <body>
      <h2>현장 통합 종합 보고서</h2>
      <p><strong>작성자:</strong> {user_id}</p>
      <p><strong>보고 기간:</strong> {period_start} ~ {period_end}</p>

      <h3>1. 차량/중장비 입출입 현황</h3>
      <p>
        {he_summary}
        <br><strong>※ 주의: 요약 시 반드시 차량/장비의 "대수", "번호", "입출입 횟수"를 구체적으로 기재할 것.<br>
        "다수", "여러 대" 등 모호한 표현 금지. 표기된 숫자, 대수, 기록을 그대로 요약문에 넣을 것.</strong>
      </p>

      <h3>2. 안전 사고 발생 내역</h3>
      <p>{acc_summary}</p>

      <h3>3. 안전장비(개인보호구) 미착용 감지 내역</h3>
      <p>{ppe_summary}</p>

      <h3>4. 종합 평가 및 주요 이슈</h3>
      <ul>
        <li>{extra_note}</li>
      </ul>
    </body>
    </html>
    """
def make_accident_html(gpt_html, period_start, period_end, user_id):
    return f"""
    <html>
    <head>
      <meta charset='utf-8'>
      <style>
        body {{ font-family: 'Pretendard', sans-serif; line-height: 1.6; padding: 20px; }}
        h2, h3 {{ font-weight: bold; }}
        p {{ margin-bottom: 10px; }}
      </style>
    </head>
    <body>
      <h2>안전사고 상세 보고서</h2>
      <p><strong>작성자:</strong> {user_id}</p>
      <p><strong>보고 기간:</strong> {period_start} ~ {period_end}</p>

      {gpt_html}

    </body>
    </html>
    """
def make_entry_html(summary, entry_table_html, period_start, period_end, user_id):
    return f"""
    <html>
    <head>
      <meta charset='utf-8'>
      <style>
        body {{ font-family: 'Pretendard', sans-serif; line-height: 1.6; padding: 20px; }}
        h2, h3 {{ font-weight: bold; }}
        table {{ border-collapse: collapse; width: 100%; margin-top: 10px; }}
        th, td {{ border: 1px solid #000; padding: 8px; text-align: left; }}
        ul {{ padding-left: 20px; }}
      </style>
    </head>
    <body>
      <h2>차량/중장비 입출입 관리 보고서</h2>
      <p><strong>작성자:</strong> {user_id}</p>
      <p><strong>관리 기간:</strong> {period_start} ~ {period_end}</p>
      

      <h3>1. 입출입 내역 요약</h3>
      <p>{summary.replace('<br>', '<br/>')}</p>

      
      {entry_table_html}

      <h3>2. 개선사항 및 현장 피드백</h3>
      <ul>
        <li>1.</li>
        <li>2.</li>
        <li>3.</li>
      </ul>

      <h3>3. 기타/특이사항</h3>
      <p>해당 없음</p>
    </body>
    </html>
    """
def make_total_html(he_summary, acc_summary, ppe_summary, period_start, period_end, user_id, gpt_html):
    return  f""" 
      {gpt_html}
    """



# 6. 보고서 생성 API
@app.route('/api/reports/generate', methods=['POST'])
def generate_report():
    try:
        data = request.get_json(force=True)
        
        period_start = data.get('period_start')
        period_end = data.get('period_end')
        user_id = data.get('user_id')
        report_type = data.get('report_type')
        use_custom_prompt = data.get('use_custom_prompt', False)
        custom_prompt = data.get('custom_prompt', '')
        extra_note = data.get('extra_note', '')
        summary = data.get("summary", '').replace('\\n', '\n')
        ppe_summary = data.get("ppe_summary", "")
        acc_summary = data.get("acc_summary", "")
        
         
         # 🚗 입출입 보고서: GPT 미사용
        if report_type == "entry":
            # summary가 이미 <table>로 시작하면(= summary가 표 자체면)
            # -> entry_table_html에 복사, summary는 ''로 비움
            if summary.strip().startswith("<table"):
                entry_table_html = summary
                summary = ""
            else:
                entry_table_html = data.get("entry_table_html", "")
            report_html = make_entry_html(summary, entry_table_html, period_start, period_end, user_id)
            return jsonify({"report_html": report_html})


        # 🧠 GPT 호출 필요 시
        print("받은 요청:", request.json)
        if use_custom_prompt and custom_prompt.strip():
            prompt = custom_prompt
        else:
            if report_type == "accident":
                prompt = make_accident_prompt(summary, period_start, period_end, user_id, extra_note)
            elif report_type == "total":
                 # summary = 차량/중장비, acc_summary = 사고, ppe_summary = 개인보호구
                prompt = make_total_prompt(summary, acc_summary, ppe_summary, period_start, period_end, user_id, extra_note)
            else:
                return jsonify({"error": "Invalid report_type"}), 400

        gpt_result_html = call_gpt_report(prompt)
        # 마크다운 ```html/``` 등 불필요 텍스트 제거
        gpt_result_html = gpt_result_html.replace("```html", "").replace("```", "")
        # HTML 템플릿에 삽입
        if report_type == "accident":
            report_html = make_accident_html(gpt_result_html, period_start, period_end, user_id)
        elif report_type == "total":
          report_html = make_total_html(summary, acc_summary, ppe_summary, period_start, period_end, user_id,gpt_result_html)

        
        response = make_response(jsonify({"report_html": report_html}), 200)
        response.headers["Content-Type"] = "application/json"
        return response
    

    except Exception as e:
        print("❌ 예외 발생:", str(e))
        return jsonify({"error": str(e)}), 500
    
@app.route("/api/reports/generate/pdf", methods=["POST"])
def generate_pdf():
    data = request.get_json()
    report_html = data.get("report_html")
    report_type = data.get("report_type", "report")
    print("[DEBUG] 받은 HTML 길이:", len(report_html))

    config = get_wkhtmltopdf_config()
    if not config:
        return make_response(("wkhtmltopdf 실행 파일을 찾지 못했습니다.", 500))

    # 옵션(한글/이미지/보안) 권장값
    options = {
        "encoding": "UTF-8",
        "enable-local-file-access": None,  # 로컬 리소스 허용
        # "quiet": ""  # 필요 시 로그 최소화
    }

    pdf_bytes = pdfkit.from_string(report_html, False, configuration=config, options=options)

    response = make_response(pdf_bytes)
    response.headers["Content-Type"] = "application/pdf"
    response.headers["Content-Disposition"] = f"attachment; filename={report_type}.pdf"
    return response
    

@app.route("/ping", methods=["GET"])
def ping():
    return "ok", 200

@app.route("/healthz", methods=["GET"])
def healthz():
    return jsonify({"status": "ok"}), 200

if __name__ == "__main__":
    print("✅ Flask 서버 시작됨")
    app.run(host="0.0.0.0", port=5001, debug=True)