package kr.cloud.web.controller;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
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
import kr.cloud.web.service.ReportApiService;


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
			        // 🔍 파라미터 추출
			        String periodStart = (String) request.get("period_start");
			        String periodEnd = (String) request.get("period_end");
			        String userId = (String) request.get("user_id");
			        String reportType = (String) request.get("report_type");
			        boolean useCustomPrompt = (Boolean) request.get("use_custom_prompt");
			        String customPrompt = (String) request.get("custom_prompt");
			        String extraNote = (String) request.get("extra_note");

			        // 🔥 핵심 호출
			        String html = reportApiService.generateReport(periodStart, periodEnd, userId, reportType, useCustomPrompt, customPrompt, extraNote);
			       
			        
			     // 🚨 String이 아니라 Map에 담아서 반환!
			        Map<String, String> result = new HashMap<>();
			        result.put("report_html", html);
			        
			        return ResponseEntity.ok(result);
			    }
			

		    // 전체 조회
		    @GetMapping
		    public List<Report> getAllReports() {
		        return reportApiService.getAllReports();
		    }

		    // ID로 조회
		    @GetMapping("/{id}")
		    public Report getReportById(@PathVariable("id") int id) {
		        return reportApiService.getReportById(id);
		    }

		    // 날짜 조건 조회
		    @GetMapping("/search")
		    public List<Report> getReportsByPeriod(@RequestParam("start") @DateTimeFormat(pattern = "yyyy-MM-dd") Date start,
		                                           @RequestParam("end") @DateTimeFormat(pattern = "yyyy-MM-dd") Date end) {
		        return reportApiService.getReportsByPeriod(start, end);
		    }
}
