package kr.cloud.web.controller;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import kr.cloud.web.entity.Report;
import kr.cloud.web.entity.ReportRequest;
import kr.cloud.web.service.NcpObjectStorageService;
import kr.cloud.web.service.ReportApiService;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import com.amazonaws.auth.policy.Resource;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfWriter;

	// 리포트 콘트롤러 
		@CrossOrigin(origins = "http://localhost:3000")
		@RestController
		@RequestMapping("/api/reports")
		public class ReportController {

			@Autowired
			private ReportApiService reportApiService;
			
			// 리포트 생성 요청
			 @PostMapping("/generate")
			    public ResponseEntity<Map<String, String>> generateReport(@RequestBody Map<String, Object> request) {
			        //  파라미터 추출
			        String periodStart = (String) request.get("period_start");
			        String periodEnd = (String) request.get("period_end");
			        String userId = (String) request.get("user_id");
			        String reportType = (String) request.get("report_type");
			        boolean useCustomPrompt = (Boolean) request.get("use_custom_prompt");
			        String customPrompt = (String) request.get("custom_prompt");
			        String extraNote = (String) request.get("extra_note");

			        //  핵심 호출
			        String html = reportApiService.generateReport(
			        	periodStart, periodEnd, userId, reportType, useCustomPrompt, customPrompt, extraNote);
			 
			        // 2. HTML이 비었거나 오류 메시지면 PDF 변환/업로드 중단
			        if (html == null || html.trim().isEmpty() || html.startsWith("보고서 생성 실패")) {
			            System.err.println("보고서 HTML 생성 실패, PDF 변환 안 함!");
			            Map<String, String> errorResult = new HashMap<>();
			            errorResult.put("error", "보고서 HTML 생성 실패");
			            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResult);
			        }
			        
			     //  PDF 생성 API호출
			        String fileUrl = reportApiService.generatePdfReportAndUpload(html, reportType, periodStart);
			       

			        //  Report 객체 생성 및 값 세팅
			        Report report = new Report();
			        report.setReportTitle("보고서_" + reportType + "_" + periodStart);  // or 원하는 방식
			        report.setTypeId(reportType.equals("accident") ? 1L : 2L);  // 타입 매핑 예시
			        report.setReportFile(fileUrl);   // 오브젝트스토리지 PDF URL
			        report.setUserId(userId);
			        report.setName(userId);          // 또는 사용자명 필드
			        report.setRegDate(new Date());   // 생성일

			        // 2 저장
			        reportApiService.saveReport(report);
			        
			     // Map에 담아서 반환
			        Map<String, String> result = new HashMap<>();
			        result.put("report_html", html);
			        result.put("pdf_url", fileUrl); 
			        
			        return ResponseEntity.ok(result);
			    }
			
		
				@PostMapping("/generate-pdf-and-upload")
				public ResponseEntity<String> generatePdfAndUpload(@RequestBody Map<String, Object> request) {
				    String html = (String) request.get("report_html");
				    String reportType = (String) request.get("report_type");
				    String periodStart = (String) request.get("period_start");
				    String fileUrl = reportApiService.generatePdfReportAndUpload(html, reportType, periodStart);
				    return ResponseEntity.ok(fileUrl);
				}
				
}
