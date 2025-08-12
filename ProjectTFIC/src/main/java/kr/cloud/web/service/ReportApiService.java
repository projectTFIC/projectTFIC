package kr.cloud.web.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import kr.cloud.web.dto.AccidentSummaryDto;
import kr.cloud.web.dto.HeRecordDto;
import kr.cloud.web.dto.PpeRecordViewDto;
import kr.cloud.web.entity.Report;
import kr.cloud.web.mapper.ReportMapper;
import lombok.RequiredArgsConstructor;

import java.nio.file.Files;
import java.nio.file.Path;
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
    private final NcpObjectStorageService ncpObjectStorageService;

    // 모든 Flask 호출은 이 베이스 URL만 사용 (배포 기본값 + 로컬)
    @Value("${ai.gpt-base-url:http://localhost:5001}")
    private String aiGptBaseUrl;

    // ----- 공통 유틸 -----
    private Date parseDate(String raw) {
        try {
            String dateStr = raw == null ? "" : raw.trim(); // 공백 제거
            if (dateStr.length() == 16) dateStr += ":00";   // yyyy-MM-dd HH:mm -> HH:mm:ss 보정
            SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            return new java.sql.Timestamp(format.parse(dateStr).getTime());
        } catch (Exception e) {
            throw new RuntimeException("날짜 형식 오류: " + raw, e);
        }
    }

    // ----- 조회 -----
    public List<Report> getReportsByPeriod(Date start, Date end) {
        return reportMapper.selectReportsByPeriod(start, end);
    }
    public Report getReportById(int reportId) {
        return reportMapper.selectReportById(reportId);
    }
    public List<Report> getAllReports() {
        return reportMapper.selectAllReports();
    }

    // ----- 요약 빌더 -----
    private String buildAccidentSummary(List<AccidentSummaryDto> records) {
        if (records == null || records.isEmpty()) return "해당 기간 동안 등록된 사고 기록이 없습니다.";
        StringBuilder sb = new StringBuilder("해당 기간 동안 사고 기록 요약:\n");
        SimpleDateFormat fmt = new SimpleDateFormat("yyyy-MM-dd HH:mm");
        for (AccidentSummaryDto r : records) {
            sb.append("- 시간: ").append(fmt.format(r.getRegDate()))
              .append(", 위치: ").append(r.getLocation())
              .append(", 내용: ").append(r.getRecordTitle())
              .append("\n");
        }
        return sb.toString();
    }

    private String buildEntrySummary(List<HeRecordDto> records) {
        if (records == null || records.isEmpty()) return "해당 기간 동안 차량/중장비 출입 기록이 없습니다.";
        StringBuilder sb = new StringBuilder();
        sb.append("<h2>차량/중장비 출입 기록</h2>")
          .append("<table border='1' cellpadding='8' cellspacing='0'>")
          .append("<thead><tr><th>장비번호</th><th>유형</th><th>출입</th><th>시간</th></tr></thead>")
          .append("<tbody>");
        SimpleDateFormat fmt = new SimpleDateFormat("yyyy-MM-dd HH:mm");
        for (HeRecordDto r : records) {
            int typeId = Integer.parseInt(r.getHeType());
            String typeName = heRecordService.getKorTypeNameById(typeId);
            sb.append("<tr>")
              .append("<td>").append(r.getHeNumber()).append("</td>")
              .append("<td>").append(typeName).append("</td>")
              .append("<td>").append(r.getAccess()).append("</td>")
              .append("<td>").append(fmt.format(r.getRegDate())).append("</td>")
              .append("</tr>");
        }
        sb.append("</tbody></table>");
        return sb.toString();
    }

    private String buildTotalSummary(String summary) {
        if (summary == null || summary.isBlank()) return "해당 기간 동안 사고 및 출입 요약 내역이 없습니다.";
        return "통합 요약:\n" + summary;
    }

    public static String summarizePpeRecords(List<PpeRecordViewDto> ppeList) {
        if (ppeList == null || ppeList.isEmpty()) return "개인보호구 미착용 사례는 발견되지 않았습니다.";
        StringBuilder sb = new StringBuilder();
        sb.append("총 ").append(ppeList.size()).append("건 미착용 감지됨.<br>");
        SimpleDateFormat fmt = new SimpleDateFormat("yyyy-MM-dd HH:mm");
        for (PpeRecordViewDto dto : ppeList) {
            sb.append("- 시간: ").append(fmt.format(dto.getRegDate())).append(", ");
            StringBuilder offItems = new StringBuilder();
            if (dto.getHelmetOff() == 1) offItems.append("안전모 ");
            if (dto.getHookOff() == 1)   offItems.append("안전고리 ");
            if (dto.getBeltOff() == 1)   offItems.append("안전벨트 ");
            if (dto.getShoesOff() == 1)  offItems.append("안전화 ");
            if (offItems.length() == 0)  offItems.append("미착용 항목 없음");
            sb.append("미착용: ").append(offItems).append("<br>");
        }
        return sb.toString();
    }

    // ====== 1) HTML 미리보기 (업로드/DB 저장 없음) ======
    public String generateReportPreview(
            String periodStart, String periodEnd, String userId,
            String reportType, boolean useCustomPrompt, String customPrompt, String extraNote) {

        Date startDate = parseDate(periodStart);
        Date endDate   = parseDate(periodEnd);

        String summaryText;
        String accSummary = "";
        String ppeSummary = "";

        switch (reportType) {
            case "accident":
                summaryText = buildAccidentSummary(
                        reportMapper.selectAccidentSummaryByPeriod(startDate, endDate));
                break;
            case "entry":
                summaryText = buildEntrySummary(
                        reportMapper.selectHeRecordsByPeriod(startDate, endDate));
                break;
            case "total":
                summaryText = buildTotalSummary(
                        reportMapper.getTotalSummaryByPeriod(startDate, endDate));
                accSummary  = buildAccidentSummary(
                        reportMapper.selectAccidentSummaryByPeriod(startDate, endDate));
                ppeSummary  = summarizePpeRecords(
                        reportMapper.selectPpeRecordsByPeriod(startDate, endDate));
                break;
            default:
                summaryText = "지원하지 않는 보고서 유형입니다.";
        }

        String url = aiGptBaseUrl + "/api/reports/generate";
        Map<String, Object> requestData = new HashMap<>();
        requestData.put("period_start", periodStart);
        requestData.put("period_end", periodEnd);
        requestData.put("user_id", userId);
        requestData.put("report_type", reportType);
        requestData.put("summary", summaryText);
        requestData.put("use_custom_prompt", useCustomPrompt);
        requestData.put("custom_prompt", customPrompt);
        requestData.put("extra_note", extraNote);
        if ("total".equals(reportType)) {
            requestData.put("acc_summary", accSummary);
            requestData.put("ppe_summary", ppeSummary);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestData, headers);

        ResponseEntity<Map> res = restTemplate.postForEntity(url, entity, Map.class);
        Map body = res.getBody();
        if (res.getStatusCode().is2xxSuccessful() && body != null && body.containsKey("report_html")) {
            return (String) body.get("report_html");
        }
        throw new RuntimeException("보고서 생성 실패: Flask 응답 없음");
    }

    // ====== 2) HTML -> PDF 바이트 ======
    public byte[] renderPdfBytes(String reportHtml, String reportType) {
        String url = aiGptBaseUrl + "/api/reports/generate/pdf";
        Map<String, Object> requestData = new HashMap<>();
        requestData.put("report_html", reportHtml);
        requestData.put("report_type", reportType);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestData, headers);

        ResponseEntity<byte[]> response = restTemplate.exchange(url, HttpMethod.POST, entity, byte[].class);
        return response.getBody();
    }

    // ====== 3) PDF 업로드 (객체스토리지) ======
    public String uploadPdf(byte[] pdfBytes, String fileName) throws Exception {
        Path temp = Files.createTempFile("report_", "_" + fileName);
        Files.write(temp, pdfBytes);
        try {
            return ncpObjectStorageService.uploadPdfToObjectStorage(temp.toString(), fileName);
        } finally {
            Files.deleteIfExists(temp);
        }
    }

    // ====== 4) Report 엔티티 저장 ======
    public int saveReport(Report report) { return reportMapper.insertReport(report); }
}
