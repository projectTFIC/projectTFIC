package kr.cloud.web.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import kr.cloud.web.entity.Report;
import kr.cloud.web.mapper.ReportMapper;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportApiService {
    @Autowired
    private ReportMapper reportMapper;

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
            // 날짜 + 시간 형식도 허용하고, 시간 잘라서 sql.Date로 변환
            SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
            java.util.Date utilDate = format.parse(dateStr.substring(0, 10));  // yyyy-MM-dd만 추출
            return new java.sql.Date(utilDate.getTime());
        } catch (Exception e) {
            throw new RuntimeException("날짜 형식 오류: " + dateStr + " → yyyy-MM-dd 형식이어야 합니다", e);
        }
    }
    // 🔹 요약 텍스트 조회
    public String getSummaryTextByType(Date start, Date end, String reportType) {
        return reportMapper.getSummaryByTypeAndPeriod(start, end, reportType);
    }

    public String generateReport(String periodStart, String periodEnd, String userId, String reportType,
            boolean useCustomPrompt, String customPrompt, String extraNote) {
    	 System.out.println("🔥 Flask 보고서 생성 호출 시도 중..."); // ✅ 호출 확인 로그

    	 // 날짜 파싱
    	 Date startDate = parseDate(periodStart);
    	 Date endDate = parseDate(periodEnd);

    	 // 유형별 요약 데이터 조회
    	 String summaryText = getSummaryTextByType(startDate, endDate, reportType);

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

    		 if (responseBody != null && responseBody.containsKey("report_html")) {
    			 return (String) responseBody.get("report_html");
    		 } else {
    			 return "보고서 생성 실패: 응답 없음 또는 형식 오류";
    		 }
    	 } catch (Exception e) {
    		 return "보고서 생성 중 오류 발생: " + e.getMessage();
    	 }
    }
}