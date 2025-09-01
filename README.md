# AI-VIS
![image](https://github.com/user-attachments/assets/bf1dce66-78f0-4ed6-83d2-9984f64b34e9)



## 👀 프로젝트 개요
감지는 신속하게, 판단은 정확하게, 대응은 스마트하게 <br/>
**AI 건설현장 안전 관리자, AI-VIS**

* **개발 주제** <br/> 
YOLO/LLM 을 이용한 스마트 현장안전 감지·관리 시스템

* **제안 배경** <br/>
건설 현장에서 반복되는 중대사고와 더불어, 중대재해처벌법 시행 및 건설안전특별법 발의 등 실시간 안전관리와 법적 책임이 강화되고 있습니다.

* **개발 목표** <br/>
건설 현장에서 사용되고 있는 감지 및 보고 관리 시스템의 한계를 극복하기 위해, 고도화된 인공지능 기술을 적용한 AI 기반의 안전관리 솔루션을 구현하고자 합니다.


## 📅 프로젝트 기간
2025.07.22 ~ 2025.08.13 (3주, 21일)


## ⭐ 주요 기능

* **객체 탐지 모델을 활용한 안전장비 탐지** <br/>
작업자의 안전장비 착용여부를 실시간으로 탐지합니다.
    * 안전모 착용 / 미착용
    * 안전벨트 착용 / 미착용
    * 안전고리 착용 / 미착용
    * 안전화 착용 / 미착용

* **객체 탐지 모델과 OCR을 활용한 중장비 탐지** <br/>
건설현장 내 중장비 16종을 실시간으로 탐지하고, 중장비의 출입 및 번호판 정보를 수집합니다.
    * 화물덤프형 1톤 이하
    * 화물덤프형 5톤 미만
    * 화물덤프형 12톤 미만
    * 화물덤프형 12톤 이상
    * 굴착기 (타이어식)
    * 굴착기 (무한궤도식)
    * 로더
    * 지게차
    * 콘크리트 믹서 트럭
    * 불도저 (무한궤도식)
    * 천공기
    * 항타·항발기
    * 화물카고 1톤 이하
    * 화물카고 5톤 미만
    * 화물카고 25톤 미만
    * 화물카고 25톤 이상

* **객체 탐지 모델과 OCR을 활용한 중장비 탐지** <br/>
작업자의 사고여부를 실시간으로 감지합니다.

* **LLM 모델을 활용한 보고서 생성** <br/>
탐지 이벤트와 축적도니 기록 정보를 기반으로 다양한 유형의 보고서를 자동 생성합니다.
    * 사고 경위서
    * 출입 내역서
    * 종합 보고서

* **실시간 건설현장 모니터링** <br/>


* **LLM 모델을 활용한 보고서 생성** <br/>
* 기능4 : 기록관리를 통한 각 사고별 기록 확인
* 기능5 : 각 사고별 기록을 바탕으로 LLM을 이용한 사고 보고서 생성
* 기능6 : 사고 보고서 목록을 조회하고 다운로드 가능
* 기능7 : 각 감지기록을 통계별로 그래프로 표현
<br>

## ⛏ 기술스택
<table>
    <tr>
        <th>구분</th>
        <th>내용</th>
    </tr>
    <tr>
        <td>사용언어</td>
        <td>
            <img src="https://img.shields.io/badge/Java-007396?style=for-the-badge&logo=java&logoColor=white"/>
            <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=HTML5&logoColor=white"/>
            <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=CSS3&logoColor=white"/>
            <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=JavaScript&logoColor=white"/>
            <img src ="https://img.shields.io/badge/Python-3776AB.svg?&style=for-the-badge&logo=Python&logoColor=white"/>
        </td>
    </tr>
    <tr>
        <td>라이브러리</td>
        <td>
            <img src="https://img.shields.io/badge/react-61DAFB?style=for-the-badge&logo=react&logoColor=white"/>
        </td>
    </tr>
        <tr>
        <td>AI</td>
        <td>
            <img src="https://img.shields.io/badge/YOLO-111F68?style=for-the-badge&logo=yolo&logoColor=white"/>
            <img src="https://img.shields.io/badge/NAVER OCR-03C75A?style=for-the-badge&logo=Naver&logoColor=white"/>
            <img src="https://img.shields.io/badge/ChatGPT-412991?style=for-the-badge&logo=openai&logoColor=white"/>
        </td>
    </tr>
    <tr>
        <td>개발도구</td>
        <td>
            <img src="https://img.shields.io/badge/springboot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white"/>
            <img src="https://img.shields.io/badge/VSCode-007ACC?style=for-the-badge&logo=VisualStudioCode&logoColor=white"/>
            <img src="https://img.shields.io/badge/jupyter-F37626?style=for-the-badge&logo=jupyter&logoColor=white"/>
        </td>
    </tr>
    <tr>
        <td>서버환경</td>
        <td>
            <img src="https://img.shields.io/badge/Apache%20Tomcat-F8DC75?style=for-the-badge&logo=apachetomcat&logoColor=black"/>
            <img src="https://img.shields.io/badge/flask-000000?style=for-the-badge&logo=flask&logoColor=white"/>
            <img src="https://img.shields.io/badge/NCP-03C75A?style=for-the-badge&logo=Naver&logoColor=white"/>
        </td>
    </tr>
    <tr>
        <td>데이터베이스</td>
        <td>
            <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white"/>
        </td>
    </tr>
    <tr>
        <td>협업도구</td>
        <td>
            <img src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=Git&logoColor=white"/>
            <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=GitHub&logoColor=white"/>
            <img src="https://img.shields.io/badge/discord-5865F2?style=for-the-badge&logo=discord&logoColor=white"/>
        </td>
    </tr>
</table>


<br>

## ⚙ 클라우드 아키텍처
![클라우드 아키텍처](https://github.com/user-attachments/assets/0ffe16f8-1f47-429c-b557-628a4b4e6c3d)
<br>


## 📌 소프트웨어 아키텍처
![image](https://github.com/user-attachments/assets/b398c9c0-78ae-44f5-80ac-dce97c76d144)
<br>

## 📌 서비스 흐름도
![image](https://github.com/user-attachments/assets/a9cf3be7-60b0-47be-a087-83115c30e07d)
<br>


## 📌 ER다이어그램
![image](https://github.com/user-attachments/assets/65efb1d6-6543-48cd-9d0a-94716c1e7e35)
<br>


## 🖥 화면 구성

### 로그인
![image](https://github.com/user-attachments/assets/15c633dc-26f4-4223-b418-157fcf742919)
<br>

### 회원가입
![image](https://github.com/user-attachments/assets/8d5045ce-97ac-4a68-a9e8-aa39ce16fc10)
<br>

### 대시보드 페이지
![image](https://github.com/user-attachments/assets/c33cfcdd-20c0-4fc6-9482-c7587093a76d)
<br>

### 모니터링
![image](https://github.com/user-attachments/assets/fc04af27-8960-4a9c-ad33-9f1a2056e8f1)
<br>

### 기록관리
![image](https://github.com/user-attachments/assets/570db902-5865-43eb-ab4c-6ee2218f01be)
![image](https://github.com/user-attachments/assets/40c03bc0-5f33-4319-acd6-b1d4cc994892)
![image](https://github.com/user-attachments/assets/fbb25229-8ba3-4f8f-b2b4-ceed4f70c687)
![image](https://github.com/user-attachments/assets/fa07b84e-ddcc-44b6-993a-ae0b64a4c56d)
<br>

### 보고서 생성
![image](https://github.com/user-attachments/assets/a4707ffa-d696-4b17-8969-b3b99334f05f)
<br>

### 보고서 게시판
![image](https://github.com/user-attachments/assets/0780f577-0477-4f44-8b75-da9d1657bbab)
![image](https://github.com/user-attachments/assets/53b6f152-f0d8-4a1c-9d11-dd25a547a61f)
<br>

### 통계
![image](https://github.com/user-attachments/assets/6ff1c1e4-87aa-4566-8fbd-c425e6435ef4)
<br>


## 👨‍👩‍👦‍👦 팀원 역할
<table>
  <tr>
    <td align="center"><img src="https://github.com/user-attachments/assets/71c745bb-4b7b-4f51-abc0-97c19f177c56" width="100" height="100"/></td>
    <td align="center"><img src="https://github.com/user-attachments/assets/71c745bb-4b7b-4f51-abc0-97c19f177c56" width="100" height="100"/></td>
    <td align="center"><img src="https://github.com/user-attachments/assets/71c745bb-4b7b-4f51-abc0-97c19f177c56" width="100" height="100"/></td>
    <td align="center"><img src="https://github.com/user-attachments/assets/71c745bb-4b7b-4f51-abc0-97c19f177c56" width="100" height="100"/></td>
    <td align="center"><img src="https://github.com/user-attachments/assets/71c745bb-4b7b-4f51-abc0-97c19f177c56" width="100" height="100"/></td>
  </tr>
  <tr>
    <td align="center"><strong>차주한</strong></td>
    <td align="center"><strong>기융</strong></td>
    <td align="center"><strong>조명현</strong></td>
    <td align="center"><strong>이도현</strong></td>
    <td align="center"><strong>이정민</strong></td>
  </tr>
  <tr>
    <td align="center"><b>PM / AI / Back-end</b></td>
    <td align="center"><b>AI / Back-end</b></td>
    <td align="center"><b>DB / AI / Back-end</b></td>
    <td align="center"><b>Front-end</b></td>
    <td align="center"><b>Front-end</b></td>
  <tr>
    <td align="center"><a href="https://github.com/cjhan5696" target='_blank'><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=GitHub&logoColor=white"/></a></td>
    <td align="center"><a href="https://github.com/kiyung1234" target='_blank'><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=GitHub&logoColor=white"/></a></td>
    <td align="center"><a href="https://github.com/xinixxx" target='_blank'><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=GitHub&logoColor=white"/></a></td>
    <td align="center"><a href="https://github.com/DoHyeonL" target='_blank'><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=GitHub&logoColor=white"/></a></td>
    <td align="center"><a href="https://github.com/Lee01244" target='_blank'><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=GitHub&logoColor=white"/></a></td>
  </tr>
</table>

## 🤾‍♂️ 트러블슈팅
개념: 문제 해결을 위해 문제의 원인을 논리적이고 체계적으로 찾는 일이며 제품이나 프로세스의 운영을 재개
프로젝트 진행하는 동안 발생했던 이슈 중 가장 기억에 남았던 문제와 해결 프로세스 나열
  
* 문제1 : 예정1<br>
  내용 예정1
 
* 문제2 : 예정2<br>
  내용 예정2
