# <img width="30" height="28" alt="image" src="https://github.com/user-attachments/assets/ee057db1-8760-4eb0-9d3c-1261c2a1a775" /> AI-VIS (TFIC 팀)
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
<br/>
<br/>

## 📅 프로젝트 기간
2025.07.22 ~ 2025.08.13 (3주, 21일)
<br/>
<br/>

## 시연 영상
https://youtu.be/VvZq4n9th5I?si=Ynw8eRVtKtwxL8gM
<br/>
<br/>

## ⭐ 주요 기능

* **객체 탐지 모델을 활용한 안전장비 탐지** <br/>
작업자의 안전장비 착용여부를 실시간으로 탐지합니다.
    * 안전모 착용 / 미착용
    * 안전벨트 착용 / 미착용
    * 안전고리 착용 / 미착용
    * 안전화 착용 / 미착용

* **객체 탐지 모델과 OCR을 활용한 중장비 탐지** <br/>
건설현장 내 중장비 16종을 실시간으로 탐지하고, 중장비의 출입 및 번호판 정보를 수집합니다.
    * 화물덤프형 1톤 이하 / 5톤 미만 / 12톤 미만 / 12톤 이상
    * 굴착기 (타이어식)
    * 굴착기 (무한궤도식)
    * 로더
    * 지게차
    * 콘크리트 믹서 트럭
    * 불도저 (무한궤도식)
    * 천공기
    * 항타·항발기
    * 화물카고 1톤 이하/ 5톤 미만 / 25톤 미만 / 25톤 이상

* **객체 탐지 모델과 OCR을 활용한 중장비 탐지** <br/>
작업자의 사고여부를 실시간으로 감지합니다.

* **LLM 모델을 활용한 보고서 생성** <br/>
탐지 이벤트와 축적된 기록 정보를 기반으로 다양한 유형의 보고서를 자동 생성합니다.
    * 사고 경위서
    * 출입 내역서
    * 종합 보고서

* **실시간 건설현장 모니터링** <br/>
건설현장에서 사용중인 영상 장비들을 관리하며, 실시간으로 현장 모니터링합니다.

* **탐지 이벤트 관리 게시판** <br/>
탐지 유형별 (안전장비 미착용, 중장비 출입, 작업자 사고) 이벤트 정보를 관리합니다.
    * 탐지 이미지 (이벤트 당시 영상 이미지, AI 탐지 결과 이미지)
    * 탐지 상세내용 (탐지 시간, 이벤트 발생 구역, 이벤트 상세 내용 등)

* **보고서 관리 게시판** <br/>
생성 유형별 (안전장비 미착용, 중장비 출입, 작업자 사고) 보고서 정보를 관리합니다.

* **현장 정보 제공** <br/>
이벤트 알림, 통계 정보, 날씨 정보, 공지사항 등 건설현장 내 다양한 정보들을 제공합니다.
    * 실시간 탐지 이벤트 알림
    * 탐지 유형별 통계 그래프
    * 발생 구역별 통계 그래프
    * 건설현장 날씨 정보
    * 건설현장 식단 정보
    * 사내 공지사항·안내사항
<br/>
<br/>


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
            <img src ="https://img.shields.io/badge/Python-3776AB.svg?&style=for-the-badge&logo=Python&logoColor=white"/>
            <img src="https://img.shields.io/badge/HTML-E34F26?style=for-the-badge&logo=HTML5&logoColor=white"/>
            <img src="https://img.shields.io/badge/CSS-1572B6?style=for-the-badge&logo=CSS3&logoColor=white"/>
            <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=JavaScript&logoColor=white"/>
        </td>
    </tr>
    <tr>
        <td>클라우드</td>
        <td>
            <img src="https://img.shields.io/badge/NAVER CLOUD PLATFORM-03C75A?style=for-the-badge&logo=Naver&logoColor=white"/>
        </td>
    </tr>
    <tr>
        <td>데이터베이스</td>
        <td>
            <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white"/>
        </td>
    </tr>     
    <tr>
        <td>프레임워크</td>
        <td>
            <img src="https://img.shields.io/badge/SpringBoot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white"/>
            <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>
            <img src="https://img.shields.io/badge/MyBatis-F80000?style=for-the-badge&logo=Oracle&logoColor=white"/>
            <img src="https://img.shields.io/badge/flask-000000?style=for-the-badge&logo=flask&logoColor=white"/>
        </td>
    </tr>
    <tr>
        <td>AI</td>
        <td>
            <img src="https://img.shields.io/badge/YOLO-111F68?style=for-the-badge&logo=yolo&logoColor=white"/>
            <img src="https://img.shields.io/badge/HyperCLOVA OCR-03C75A?style=for-the-badge&logo=Naver&logoColor=white"/>
            <img src="https://img.shields.io/badge/ChatGPT-412991?style=for-the-badge&logo=openai&logoColor=white"/>
        </td>
    </tr>
    <tr>
        <td>IDE</td>
        <td>
            <img src="https://img.shields.io/badge/STS4-6DB33F?style=for-the-badge&logo=spring&logoColor=white"/>
            <img src="https://img.shields.io/badge/Visual_Studio_Code-0078D4?style=for-the-badge&logo=visual%20studio%20code&logoColor=white"/>
            <img src="https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white"/>
            <img src="https://img.shields.io/badge/Colab-F9AB00?style=for-the-badge&logo=googlecolab&color=525252"/>
        </td>
    </tr>
    <tr>
        <td>ETC</td>
        <td>
            <img src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=Git&logoColor=white"/>
            <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=GitHub&logoColor=white"/>
            <img src="https://img.shields.io/badge/discord-5865F2?style=for-the-badge&logo=discord&logoColor=white"/>
            <img src="https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white"/>
            <img src="https://img.shields.io/badge/jupyter-F37626?style=for-the-badge&logo=jupyter&logoColor=white"/>
            <img src="https://img.shields.io/badge/dbdiagram.io-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"/>
        </td>
    </tr>
</table>

<br/>
<br/>

## 🖥 프로젝트 구성

### 로그인
<p align="center">
   <img width="1919" height="1080" alt="로그인 페이지" src="https://github.com/user-attachments/assets/8261ab1f-bdc6-4360-bb46-d4cd9daac1e4" />
</p>
<br/>

### 회원가입
<p align="center">
   <img width="1920" height="1080" alt="회원가입 페이지" src="https://github.com/user-attachments/assets/42563b16-ef68-4910-ab8a-8b4c2a2c8853" />
</p>
<br/>

### 대시보드 페이지
<p align="center">
   <img width="1892" height="1080" alt="대시보드 페이지" src="https://github.com/user-attachments/assets/43732fdd-51f7-4af3-a34a-813b169c7d7f" />
</p>
<br/>

### 모니터링
<p align="center">
   <img width="1901" height="1071" alt="모니터링 페이지" src="https://github.com/user-attachments/assets/d3b90753-7f7b-4d1c-bbd3-30e85d4cef6e" />
</p>
<br/>

### 기록관리
* **사고 감지**
<p align="center">
   <img width="1888" height="954" alt="기록관리 페이지 01" src="https://github.com/user-attachments/assets/fa9ddd31-db4c-4995-969c-8f073ba6d316" />
</p>
<p align="center">
   <img width="1895" height="1072" alt="기록관리 페이지 내용 01" src="https://github.com/user-attachments/assets/0dd34676-26da-4e28-8651-988ca2789206" />
</p>
<br/>

* **안전장비 미착용 감지**
<p align="center">
   <img width="1884" height="951" alt="기록관리 페이지 02" src="https://github.com/user-attachments/assets/7bd0baca-8ea6-4f35-869a-cb47def93495" />
</p>
<p align="center">
   <img width="1895" height="1073" alt="기록관리 페이지 내용 02" src="https://github.com/user-attachments/assets/644f13c8-9bfd-42fc-9ac4-5b89612a899f" />
</p>
<br/>

* **입출입 감지**
<p align="center">
   <img width="1890" height="949" alt="기록관리 페이지 03" src="https://github.com/user-attachments/assets/782fb7db-2440-471a-b39b-d0b28084f84e" />
</p>
<p align="center">
   <img width="1899" height="1069" alt="기록관리 페이지 내용 03" src="https://github.com/user-attachments/assets/78583286-258d-4129-9376-f84dc02892ee" />
</p>
<br/>

### 보고서 생성
<p align="center">
   <img width="1885" height="1080" alt="보고서 생성 페이지 01" src="https://github.com/user-attachments/assets/81957d8b-7cb8-434b-9877-acfcf23480aa" />
</p>
<br/>

### 보고서 게시판
<p align="center">
   <img width="1883" height="1077" alt="보고서 페이지 01" src="https://github.com/user-attachments/assets/2d37f429-8c1b-4fb3-b811-66b47f2e32d5" />
</p>
<br/>

### 통계
* **탐지유형별 통계**
<p align="center">
   <img width="1892" height="1080" alt="통계 페이지 01" src="https://github.com/user-attachments/assets/751805ea-ac62-42ca-be8e-8b3284aed25c" />
</p>
<br/>

* **발생구역별 통계**
<p align="center">
   <img width="1905" height="1080" alt="통계 페이지 02" src="https://github.com/user-attachments/assets/4edac1dc-c545-43a3-bb3d-349db18fc1ea" />
</p>
<br/>
<br/>


## ⚙ 프로젝트 설계

### 📌 메뉴 구성도
<p align="center">
   <img width="1232" height="645" alt="메뉴 구성도 20250814" src="https://github.com/user-attachments/assets/0d700f68-3fa4-444a-9b66-685f0deab1b8" />
</p>   
<br/>

### 📌 유스케이스 다이어그램
<p align="center">
   <img width="791" height="934" alt="유스케이스 다이어그램 20250726" src="https://github.com/user-attachments/assets/7c913c65-c2ca-4c71-b52a-720b24822bd7" />
</p>   
<br/>

### 📌 ER 다이어그램
<p align="center">
   <img width="1762" height="1079" alt="실전 프로젝트   TFIC  ER 다이어그램 20250813" src="https://github.com/user-attachments/assets/be0b86d2-62eb-40fd-878b-716c7e8bb76f" />
</p> 
<br/>

### 📌 클라우드 아키텍처
<p align="center">
   <img width="1250" height="1070" alt="아키텍처 클라우드 20250805" src="https://github.com/user-attachments/assets/844ca716-21b7-4076-8c7b-408e5729d28f" />
</p> 
<br/>

### 📌 소프트웨어 아키텍처
<p align="center">
   <img width="1031" height="1075" alt="아키텍처 소프트웨어 20250805" src="https://github.com/user-attachments/assets/cc55bf93-880c-49e5-87d3-86df5494ec0c" />
</p> 
<br/>

### 📌 서비스 흐름도
<p align="center">
   <img width="1782" height="1078" alt="아키텍처 서비스 01 20250805" src="https://github.com/user-attachments/assets/3bc8508b-8724-417d-a8ef-6f5f819280d9" />
</p>
<br/>

<p align="center">
   <img width="1770" height="1077" alt="아키텍처 서비스 02 20250805" src="https://github.com/user-attachments/assets/2008f3af-aecc-4a05-b179-dbbd333552bb" />
</p>
<br/>
<br/>


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


