<%@ page language="java" contentType="text/html; charset=UTF-8"
   pageEncoding="UTF-8"%>
   
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<c:set var = "cpath" value = "${pageContext.request.contextPath}" />

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>모니터링 페이지</title>
    <!-- Bootstrap 3 CSS -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
    <!-- jQuery -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
    <!-- Bootstrap 3 JS -->
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>

    <style>
        html, body {
            height: 100%;
            margin: 0;
            padding: 0;
        }
        .main-container {
            display: flex;
            height: 100%;
        }
        .sidebar {
            width: 200px; 
            background-color: #f8f8f8;
            padding: 20px;
            border-right: 1px solid #ddd;
        }
        .content-area {
            flex-grow: 1;
            padding: 20px;
            display: flex;
            flex-direction: column;
        }
        .main-content {
            flex-grow: 1; 
            display: flex;
            overflow: hidden;
        }
        .video-section {
            flex-grow: 1;
            padding-right: 20px;
            display: flex;
            flex-direction: column;
        }
        .video-section .panel {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            margin-bottom: 0; /* 패널 하단 마진 제거 */
        }
        .video-section .panel-body {
            flex-grow: 1;
        }
        .video-placeholder {
            width: 100%;
            height: 100%;
            background-color: #333;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
        }
        
        .device-list-section {
            width: 300px; 
            display: flex;
            flex-direction: column;
        }
        .tab-content {
            flex-grow: 1;
            overflow-y: auto; /* 내용 많아지면 스크롤 */
            border: 1px solid #ddd;
            border-top: none;
            padding: 15px;
        }
        
        .action-buttons {
            padding-top: 20px;
            text-align: center;
        }
        .action-buttons .btn {
            margin: 0 10px;
        }
    </style>
    
</head>
<body>

    <div class = "main-container">
    
        <!-- 1. 사이드 메뉴 -->
        <div class = "sidebar">
        
            <h3>메뉴</h3>
            
            <ul class = "nav nav-pills nav-stacked">
            
                <li class = "active"><a href = "#">대시보드</a></li>
                <li><a href = "${cpath}/GoMonitoring">모니터링</a></li>
                <li><a href = "#">기록관리</a></li>
                <li><a href = "#">보고서관리</a></li>
                <li><a href = "#">통계관리</a></li>
                
            </ul>
            
        </div>


        <!-- 2. 메인 페이지 -->
        <div class = "content-area">
        
            <div class = "main-content">
            
                <!-- [ 1. 영상 스트리밍 화면 ] -->
                <div class = "video-section">
                
                    <div class = "panel panel-primary">
                    
                        <div class = "panel-heading">
                            <h3 class = "panel-title">실시간 영상</h3>
                        </div>

                    </div>
                    
                    
                    <!-- [ 2. 영상 기능 버튼 ] -->
                    <div class = "action-buttons">
                    
                        <button type = "button" onclick = "location.href = '${cpath}/goAiDetect'" class = "btn btn-danger">
                            <span> AI 실시간 탐지 </span>
                            <!-- 영상 화면을 캡쳐하여 AI 객체 탐지 요청 -->
                        </button>
                        
                        <button type = "button" onclick = "location.href = '${cpath}/goCapture'" class = "btn btn-primary">
                            <span> 실시간 캡쳐 </span>
                             <!-- 영상 화면을 캡쳐하여 이미지 저장 -->
                        </button>
                        
                        <button type = "button" onclick = "location.href = '${cpath}/goAiConvert'" class = "btn btn-success">
                            <span> AI 탐지 전환 </span> 
                             <!-- 영상 화면을 객체 탐지 결과 형태의 화면으로 전환 -->
                        </button>
                        
                    </div>
                </div>


                <!-- [ 2. 영상 장비 게시판 ] -->
                <div class = "device-list-section">
                
                    <!-- ㅇ 서브 메뉴 - 영상 리스트 / 영상 추가 -->
                    <ul class = "nav nav-tabs">
                    
                        <li class = "active"><a data-toggle = "tab" href = "#devuceList">영상 리스트</a></li>
                        <li><a data-toggle = "tab" href = "#deviceAdd">영상 추가</a></li>
                        
                    </ul>

                    
                    <div class = "tab-content">
                    
                        <!-- 1) 영상 리스트 -->
                        <div id = "devuceList" class = "tab-pane fade in active">
                        
                            <p>장비를 선택하여 영상을 확인하세요.</p>
                            
                            <div class = "list-group">
                            
                                <c:forEach items = "${devicelist}" var = "dl">
                                
                                    <a href = "#" class = "list-group-item">
                                        <h4 class = "list-group-item-heading">${dl.deviceId} (${dl.deviceName})</h4>
                                        <p class = "list-group-item-text">${dl.location}</p>
                                    </a>
                                    
                                </c:forEach>
                                
                                <c:if test = "${empty devicelist}">
                                
                                    <p class = "text-center">등록된 장비가 없습니다.</p>
                                    
                                </c:if>
                                
                            </div>
                            
                        </div>
                        
                        
                        <!-- 2) 영상 추가 -->
                        <div id = "deviceAdd" class = "tab-pane fade">
                        
                            <h4>새 영상 장비 등록</h4>
                            
                            <form action = "${cpath}/setDevice" method = "post" style = "margin-top: 15px;">
                            
                                <div class = "form-group">
                                    <label for = "deviceName">장비 이름:</label>
                                    <input type = "text" class = "form-control" name = "deviceName">
                                </div>
                                
                                <div class = "form-group">
                                    <label for = "location">설치 장소:</label>
                                    <input type = "text" class = "form-control" name = "location">
                                </div>
                                
                                <div class = "form-group">
                                    <label for = "ipAddress">IP 주소:</label>
                                    <input type = "text" class="form-control" name = "ipAddress">
                                </div>
                                
                                <div class = "form-group">
                                    <label for = "portNumber">포트번호:</label>
                                    <input type = "text" class = "form-control" name = "portNumber">
                                </div>
                                
                                <div class = "form-group">
                                    <label for = "registrantName">등록자 이름:</label>
                                    <input type="text" class="form-control" id="nnameame" name="registrantName">
                                </div>
                                
                                <div class = "form-button">
                                	<button type = "submit" class = "btn btn-primary btn-block">장비 등록</button>
                                	<button type = "reset" class = "btn btn-primary btn-block">초기화</button>
                                	
                                </div>
                             
                                
                            </form>
                            
                        </div>
                        
                    </div>
                    
                </div>
                
            </div>
            
        </div>
        
    </div>
</body>
</html>
