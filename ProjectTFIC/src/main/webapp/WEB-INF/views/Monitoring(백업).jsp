<%@ page language="java" contentType="text/html; charset=UTF-8"
   pageEncoding="UTF-8"%>
   
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<c:set var = "cpath" value = "${pageContext.request.contextPath}" />

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Insert title here</title>

<link rel="stylesheet"
   href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
<!-- jQuery library -->
<script
   src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
<!-- Latest compiled JavaScript -->
<script
   src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
<meta charset="UTF-8">

</head>
<body>
	
	<!-- [ 사이드 메뉴 ] -->
 	<div class="sidemenu">
 	
		<h3>메뉴</h3>
        <ul class="nav nav-pills nav-stacked">
	        <li class="active"><a href="#">대시보드</a></li>
	        <li><a href="#">모니터링</a></li>
	        <li><a href="#">기록관리</a></li>
	        <li><a href="#">보고서관리</a></li>
	        <li><a href="#">통계관리</a></li>
        </ul>
	   
   </div>
	
   <div class="container">
   
      <div class="panel panel-default">
      
         <div class="col">
         
            <div class="panel-heading">MONITORING</div>
            
            <!-- [ 3. 게시글 검색하는 검색창 구현 ] -->
            <form class = "form-inline" action = "${cpath}/goMonitoring" method = "post">
            
            	<div class="form-group">
            	
				  <label for="sel1" style="margin-left: 15px; margin-right: 5px;">검색 조건</label>
				  
				  <select class="form-control" name = "filter" id="sel1">
				  
				    <option>작성자</option>
				    <option>제목</option>
				    <option>내용</option>
				    
				  </select>
				  
				</div>
                
                <div class = "form-group" style="margin-left: 5px;">
                
                	<input type = "text" name = "searchContent" class = "form-control">
                	<button type = "submit" class = "btn btn-primary">검색</button>
                
                </div>
                                 
            </form>
            
            
            <div class="panel-body">
            
               <table class="table table-bordered table-hover table-striped">
               
                  <tr>
                  
                     <th>아이디</th>
                     <th>이름</th>
                     <th>위치</th>
                     
                  </tr>
				  <!-- [ 영상 장비 게시판 ] -->
                  <c:forEach items="${devicelist}" var="dl">
                  
                     <tr>
                     	<!-- 
                     	영상 장비 리스트에서 다음과 같은 정보를 표시함
                     		장비 ID	   장비 이름		설치장소
                     	-->
                        <td>${dl.deviceId}</td>
                        <td>${dl.deviceName}</td>
                        <td>${dl.location}</td>
                        
                     </tr>
                     
                  </c:forEach>
                  
               </table>
               
               <!-- [ 영상 장비 등록버튼 ] -->
               <button onclick = "location.href = '${cpath}/goInsert'" class="btn btn-success">장비등록</button>

               
            </div>
            
         </div>
         
      </div>
      
    </div>
   	
	
</body>
</html>