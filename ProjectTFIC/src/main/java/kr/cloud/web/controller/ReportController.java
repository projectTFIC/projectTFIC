package kr.cloud.web.controller;

import java.util.Date;
import java.util.Map;
import java.sql.Timestamp;

import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType; 
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import kr.cloud.web.entity.Report;
import kr.cloud.web.service.ReportApiService;
import lombok.RequiredArgsConstructor;


	// 리포트 콘트롤러 
//		@CrossOrigin(origins = "http://localhost:3000")
		@RestController
		@RequestMapping("/api/reports")
		@RequiredArgsConstructor
		public class ReportController {

			private final ReportApiService reportApiService;
			 // 1) 미리보기: HTML만
		    @PostMapping("/generate")
		    public ResponseEntity<Map<String, String>> generateReport(@RequestBody Map<String, Object> req) {
		        String html = reportApiService.generateReportPreview(
		                (String)req.get("period_start"),
		                (String)req.get("period_end"),
		                (String)req.get("user_id"),
		                (String)req.get("report_type"),
		                (Boolean)req.getOrDefault("use_custom_prompt", false),
		                (String)req.getOrDefault("custom_prompt",""),
		                (String)req.getOrDefault("extra_note","")
		            );
		        return ResponseEntity.ok(Map.of("report_html", html));
		    }
			// 2) 저장 버튼: HTML -> PDF 렌더 + 업로드 + DB 저장
			    @PostMapping("/save")
			    public ResponseEntity<Map<String, String>> saveReport(@RequestBody Map<String, Object> request) {
			    	
			    	try {
			            String html        = (String) request.get("report_html");
			            String reportType  = (String) request.get("report_type");
			            String periodStart = (String) request.getOrDefault("period_start", null);
			            String userId      = (String) request.getOrDefault("user_id", "unknown");

			            if (html == null || html.isBlank()) {
			                return ResponseEntity.badRequest().body(Map.of("error", "report_html is empty"));
			            }

			            byte[] pdfBytes = reportApiService.renderPdfBytes(html, reportType);

			            String dateStr  = periodStart == null ? "" :
			                    periodStart.replace(":","").replace("-","").replace(" ","_");
			            String fileName = "report_" + reportType + (dateStr.isBlank() ? "" : "_" + dateStr) + ".pdf";
			            String fileUrl  = reportApiService.uploadPdf(pdfBytes, fileName);

			            // DB 저장
			            Report report = new Report();
			            report.setReportTitle("보고서_" + reportType + (periodStart != null ? "_" + periodStart : ""));
			            // TODO: 타입 매핑은 실제 값에 맞게 조정
			            long typeId = switch (reportType) {
			            case "accident" -> 1L;
			            case "entry"    -> 2L;
			            case "total"    -> 3L;   // 
			            default         -> 0L;   // 안전망
			        };
			            report.setTypeId(typeId);
			            report.setReportFile(fileUrl);
			            report.setUserId(userId);
			            report.setName(userId);
			            report.setRegDate(new Timestamp(System.currentTimeMillis()));
			            reportApiService.saveReport(report);

			            
			            return ResponseEntity.ok(Map.of("pdf_url", fileUrl));
			        } catch (Exception e) {
			            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
			        }
			    }

			    // 3) (옵션) 업로드 없이 PDF 바이트만 반환 — 즉시 다운로드/뷰어용
			    @PostMapping(value = "/preview-pdf", produces = MediaType.APPLICATION_PDF_VALUE)
			    public ResponseEntity<byte[]> previewPdf(@RequestBody Map<String, Object> request) {
			        String html       = (String) request.get("report_html");
			        String reportType = (String) request.get("report_type");
			        byte[] pdfBytes   = reportApiService.renderPdfBytes(html, reportType);
			        return ResponseEntity.ok()
			                .header("Content-Disposition", "attachment; filename=report_preview.pdf")
			                .body(pdfBytes);
			    }
			}