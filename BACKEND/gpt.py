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
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# 3. GPT 호출 함수
def call_gpt_report(prompt):
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
    "너는 건설현장 보고서를 작성하는 GPT 보고서 작성기야."
    "절대 아래 지시를 어기지 마. 지키지 않으면 무효로 간주된다."
    "**보고서 출력 규칙 (HTML ONLY)**"
    "1. 반드시 HTML 형식으로 출력할 것"
    "2. 각 항목은 <h3>로 제목 작성"
    "3. 문단은 <p> 태그로 작성. 줄바꿈은 <br> 또는 <br/> 사용"
    "4. 보고서 마지막에는 반드시 <h3>=== 원본 데이터 ===</h3> 이후 <pre>로 summary 원문 삽입"
    "예시:"
    "<h3>1. 사고 개요</h3>"
    "<p>내용입니다.<br>줄바꿈 내용입니다.</p>"
    "형식 위반 시 출력은 무효입니다. 반드시 위 형식으로 작성하세요."
  )
},
            {"role": "user", "content": prompt}
        ]
    )
    return response.choices[0].message.content

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

<h3>=== 원본 데이터 ===</h3>
<pre>
{summary}
</pre>

**주의사항**: 반드시 HTML로 출력하며, 문장은 간결하고 명확하게 작성해주세요.
"""


def make_entry_prompt(entry_summary, entry_table_html, period_start, period_end, user_id):
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
      <p>{entry_summary.replace('<br>', '<br/>')}</p>

      <h3>2. 차량 출입 테이블</h3>
      {entry_table_html}

      <h3>3. 개선사항 및 현장 피드백</h3>
      <ul>
        <li>출차 시 동일한 방식으로 기록 필요</li>
        <li>집중 출입 시간 분산 방안 고려</li>
        <li>실시간 모니터링 시스템 검토</li>
      </ul>

      <h3>4. 기타/특이사항</h3>
      <p>해당 없음</p>
    </body>
    </html>
    """

def make_total_prompt(he_summary, acc_summary, ppe_summary, period_start, period_end, user_id, extra_note=""):
    return f"""
    <html>
    <head>
      <meta charset='utf-8'>
      <style>
        body {{ font-family: 'Pretendard', sans-serif; line-height: 1.6; padding: 20px; }}
        h2, h3 {{ font-weight: bold; }}
        ul {{ padding-left: 20px; }}
      </style>
    </head>
    <body>
      <h2>현장 통합 종합 보고서</h2>
      <p><strong>작성자:</strong> {user_id}</p>
      <p><strong>보고 기간:</strong> {period_start} ~ {period_end}</p>

      <h3>1. 차량/중장비 입출입 현황</h3>
      <p>{he_summary}</p>

      <h3>2. 안전 사고 발생 내역</h3>
      <p>{acc_summary}</p>

      <h3>3. 안전장비(개인보호구) 미착용 감지 내역</h3>
      <p>{ppe_summary}</p>

      <h3>4. 종합 평가 및 주요 이슈</h3>
      <ul>
        <li>반복 이슈 및 위험 요소 요약</li>
      </ul>

      <h3>5. 조치 현황 및 예방대책</h3>
      <ul>
        <li>사고/미착용/입출입 관련 교육 및 실행 방안</li>
      </ul>

      <h3>6. 참고/특이사항</h3>
      <p>{extra_note if extra_note else '- 해당 없음'}</p>
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

      <h3>2. 차량 출입 테이블</h3>
      {entry_table_html}

      <h3>3. 개선사항 및 현장 피드백</h3>
      <ul>
        <li>출차 시 동일한 방식으로 기록 필요</li>
        <li>집중 출입 시간 분산 방안 고려</li>
        <li>실시간 모니터링 시스템 검토</li>
      </ul>

      <h3>4. 기타/특이사항</h3>
      <p>해당 없음</p>
    </body>
    </html>
    """
def make_total_html(gpt_html, he_summary, acc_summary, period_start, period_end, user_id):
    return f"""
    <html>
    <head>
      <meta charset='utf-8'>
      <style>
        body {{ font-family: 'Pretendard', sans-serif; line-height: 1.6; padding: 20px; }}
        h2, h3 {{ font-weight: bold; }}
        ul {{ padding-left: 20px; }}
        p {{ margin-bottom: 10px; }}
      </style>
    </head>
    <body>
      <h2>현장 통합 종합 보고서</h2>
      <p><strong>작성자:</strong> {user_id}</p>
      <p><strong>보고 기간:</strong> {period_start} ~ {period_end}</p>

      {gpt_html}

    </body>
    </html>
    """



# 6. 보고서 생성 API
@app.route('/api/report/generate', methods=['POST'])
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
        summary = data.get("summary", '').replace('\\n', '\n')  # 🔥 개행 복원


         # 🚗 입출입 보고서: GPT 미사용
        if report_type == "entry":
            if summary.strip().startswith("<table"):
                entry_table_html = summary  # 이미 HTML 테이블 형식이면 그대로 사용
            else:
                entry_table_html = make_entry_prompt(summary, period_start, period_end, user_id, extra_note)
            report_html = make_entry_html(summary, entry_table_html, period_start, period_end, user_id)
            return jsonify({"report_html": report_html})

        # 🧠 GPT 호출 필요 시
        if use_custom_prompt and custom_prompt.strip():
            prompt = custom_prompt
        else:
            if report_type == "accident":
                prompt = make_accident_prompt(summary, period_start, period_end, user_id, extra_note)
            elif report_type == "total":
                prompt = make_total_prompt(summary, "-", "-", period_start, period_end, user_id, extra_note)
            else:
                return jsonify({"error": "Invalid report_type"}), 400

        gpt_result_html = call_gpt_report(prompt)

        # HTML 템플릿에 삽입
        if report_type == "accident":
            report_html = make_accident_html(gpt_result_html, period_start, period_end, user_id)
        elif report_type == "total":
            report_html = make_total_html(gpt_result_html, "-", "-", period_start, period_end, user_id)

        return jsonify({"report_html": report_html})

    except Exception as e:
        print("❌ 예외 발생:", str(e))
        return jsonify({"error": str(e)}), 500
    
if __name__ == "__main__":
    print("✅ Flask 서버 시작됨")
    app.run(host="0.0.0.0", port=5000, debug=True)