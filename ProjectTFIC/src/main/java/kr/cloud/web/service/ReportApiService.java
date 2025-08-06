package kr.cloud.web.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import kr.cloud.web.entity.AccidentSummaryDto;
import kr.cloud.web.service.HeRecordService;
import kr.cloud.web.entity.HeRecordDto;
import kr.cloud.web.entity.Report;
import kr.cloud.web.mapper.ReportMapper;
import lombok.RequiredArgsConstructor;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Service
@RequiredArgsConstructor
public class ReportApiService {
    
    private final ReportMapper reportMapper;
    private final HeRecordService heRecordService;
    private final RestTemplate restTemplate;
    

    public List<Report> getReportsByPeriod(Date start, Date end) {
        return reportMapper.selectReportsByPeriod(start, end);
    }

    public Report getReportById(int reportId) {
        return reportMapper.selectReportById(reportId);
    }

    public List<Report> getAllReports() {
        return reportMapper.selectAllReports();
    }
    
    private Date parseDate(String dateStr) {
        try {
            // 초가 없으면 강제로 붙이기
            if (dateStr.length() == 16) {  // yyyy-MM-dd HH:mm
                dateStr += ":00";
            }

            SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            return new java.sql.Timestamp(format.parse(dateStr).getTime());

        } catch (Exception e) {
            throw new RuntimeException("날짜 형식 오류: " + dateStr, e);
        }
    }

    // 🔹 보고서 유형별 요약 생성 로직
    private String buildAccidentSummary(List<AccidentSummaryDto> records) {
        if (records == null || records.isEmpty()) {
            return "해당 기간 동안 등록된 사고 기록이 없습니다.";
        }

        StringBuilder sb = new StringBuilder("해당 기간 동안 사고 기록 요약:\n");
        for (AccidentSummaryDto r : records) {
            sb.append("- 시간: ").append(new SimpleDateFormat("yyyy-MM-dd HH:mm").format(r.getRegDate()))
              .append(", 위치: ").append(r.getLocation())
              .append(", 내용: ").append(r.getRecordTitle())
              .append("\n");
        }
        return sb.toString();
    }

    private String buildEntrySummary(List<HeRecordDto> records) {
        if (records == null || records.isEmpty()) {
            return "해당 기간 동안 차량/중장비 출입 기록이 없습니다.";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("<h2>차량/중장비 출입 기록</h2>");
        sb.append("<table border='1' cellpadding='8' cellspacing='0'>");
        sb.append("<thead><tr><th>장비번호</th><th>유형</th><th>출입</th><th>시간</th></tr></thead>");
        sb.append("<tbody>");

        for (HeRecordDto r : records) {
            int typeId = Integer.parseInt(r.getHeType());
            String typeName = heRecordService.getKorTypeNameById(typeId);

            sb.append("<tr>")
              .append("<td>").append(r.getHeNumber()).append("</td>")
              .append("<td>").append(typeName).append("</td>")
              .append("<td>").append(r.getAccess()).append("</td>")
              .append("<td>").append(new SimpleDateFormat("yyyy-MM-dd HH:mm").format(r.getRegDate())).append("</td>")
              .append("</tr>");
        }

        sb.append("</tbody></table>");
        return sb.toString();
    }

    private String buildTotalSummary(String summary) {
        if (summary == null || summary.isBlank()) {
            return "해당 기간 동안 사고 및 출입 요약 내역이 없습니다.";
        }
        return "통합 요약:\n" + summary;
    }

    public String generateReport(String periodStart, String periodEnd, String userId, String reportType,
            boolean useCustomPrompt, String customPrompt, String extraNote) {
    	
    	 // 날짜 파싱
    	 Date startDate = parseDate(periodStart);
    	 Date endDate = parseDate(periodEnd);

    	  // 2. 요약 텍스트 생성
         String summaryText;
         switch (reportType) {
             case "accident":
                 summaryText = buildAccidentSummary(reportMapper.selectAccidentSummaryByPeriod(startDate, endDate));
                 break;
             case "entry":
            	 List<HeRecordDto> records = reportMapper.selectHeRecordsByPeriod(startDate, endDate);
            	    System.out.println("🛞 출입 기록 조회 결과: " + records.size() + "건");
            	    for (HeRecordDto rec : records) {
            	        System.out.println("  👉 " + rec);  // toString 있는 경우
            	    }

            	    summaryText = buildEntrySummary(records);
            	    break;
             case "total":
                 summaryText = buildTotalSummary(reportMapper.getTotalSummaryByPeriod(startDate, endDate));
                 break;
             default:
                 summaryText = "지원하지 않는 보고서 유형입니다.";
         }

         System.out.println("🕐 START: " + startDate);
    	 System.out.println("🕐 END: " + endDate);
    	 System.out.println("📄 요약 내용: " + summaryText);
    	 
    	 
    	 // Flask API 주소
    	 String flaskUrl = "http://192.168.219.176:5000/api/report/generate";

    	 // JSON 요청 바디 구성
    	 Map<String, Object> requestData = new HashMap<>();
    	 requestData.put("period_start", periodStart);
    	 requestData.put("period_end", periodEnd);
    	 requestData.put("user_id", userId);
    	 requestData.put("report_type", reportType);
    	 requestData.put("summary", summaryText); // 🔥 요약 포함
    	 requestData.put("use_custom_prompt", useCustomPrompt);
    	 requestData.put("custom_prompt", customPrompt);
    	 requestData.put("extra_note", extraNote);

    	 // HTTP 요청 설정
    	 HttpHeaders headers = new HttpHeaders();
    	 headers.setContentType(MediaType.APPLICATION_JSON);
    	 HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestData, headers);

    	 // 요청 전송 및 응답 처리
    	 try {
    		 ResponseEntity<Map> response = new RestTemplate().postForEntity(flaskUrl, entity, Map.class);
    		 Map<String, Object> responseBody = response.getBody();
    		 

    		    System.out.println("🔥 Flask 응답: " + responseBody); // 이거 추가
    		    System.out.println("🔥 전송할 JSON: " + requestData);
    		    ObjectMapper mapper = new ObjectMapper();
    		    try {
    		        String jsonString = mapper.writeValueAsString(requestData);
    		        System.out.println("🔥 실제 전송 JSON: " + jsonString);
    		    } catch (JsonProcessingException e) {
    		        e.printStackTrace();
    		    }
    		 if (responseBody != null && responseBody.containsKey("report_html")) {
    			 return (String) responseBody.get("report_html");
    		 } else {
    			 return "보고서 생성 실패: 응답 없음 또는 형식 오류";
    		 }
    	 } catch (Exception e) {
    		 return "보고서 생성 중 오류 발생: " + e.getMessage();
    	 }
    }
    // GPT 보고서를 PDF로 저장하는 메서드
    public String generatePdfReport(String reportHtml, String reportType) {
        try {
            String flaskUrl = "http://localhost:5000/api/report/generate/pdf";

            Map<String, Object> requestData = new HashMap<>();
            requestData.put("report_html", reportHtml);
            requestData.put("report_type", reportType);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestData, headers);

            ResponseEntity<byte[]> response = restTemplate.exchange(flaskUrl, HttpMethod.POST, entity, byte[].class);
            byte[] pdfBytes = response.getBody();

            String desktopPath = System.getProperty("user.home") + "/Desktop/";
            String fileName = "report_" + reportType + ".pdf";
            Path path = Paths.get(desktopPath + fileName);

            Files.createDirectories(path.getParent()); // 바탕화면은 대부분 있지만 안전하게
            Files.write(path, pdfBytes);

            return fileName;
        } catch (Exception e) {
            e.printStackTrace();
            return "보고서 PDF 저장 실패: " + e.getMessage();
        }
    
    }
}