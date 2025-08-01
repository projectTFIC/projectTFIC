package kr.cloud.web.controller;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
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
import kr.cloud.web.service.ReportApiService;
import java.io.FileOutputStream;
import java.io.IOException;
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
			
			 // ✅ PDF 생성 메서드 추가
			    @PostMapping("/generate-pdf")
			    public ResponseEntity<String> generatePdf(@RequestBody ReportRequest request) {
			        String filename = "report-" + request.getUserId() + "-" + request.getDate() + ".pdf";
			        String filepath = "/tmp/" + filename;

			        try {
			            // 페이지 여백 포함한 PDF 문서 생성
			            Document document = new Document(PageSize.A4, 50, 50, 50, 50);
			            PdfWriter.getInstance(document, new FileOutputStream(filepath));
			            document.open();

			            // 보고서 타입에 따라 다른 양식 적용
			            switch (request.getReportType()) {
			                case "summary":
			                    generateSummaryStyle(document, request);
			                    break;
			                case "incident":
			                    generateIncidentStyle(document, request);
			                    break;
			                case "inspection":
			                    generateInspectionStyle(document, request);
			                    break;
			                default:
			                    throw new IllegalArgumentException("알 수 없는 보고서 유형: " + request.getReportType());
			            }

			            document.close();

			            String url = uploadToObjectStorage(filepath, filename); // 오브젝트 스토리지 업로드
			            return ResponseEntity.ok(url);

			        } catch (Exception e) {
			            e.printStackTrace();
			            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("PDF 생성 실패");
			        }
			    }
			    // 수정해야됨 
			    private String uploadToObjectStorage(String filepath, String filename) {
					// TODO Auto-generated method stub
					return "https://fake-url.com/reports/" + filename;
				}
			    
			    private void addTitle(Document doc, String titleText) throws DocumentException {
			        Font titleFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD);
			        Paragraph title = new Paragraph(titleText, titleFont);
			        title.setAlignment(Element.ALIGN_CENTER);
			        title.setSpacingAfter(20f);
			        doc.add(title);
			    }

			    private void addInfo(Document doc, ReportRequest req) throws DocumentException {
			        Font infoFont = new Font(Font.FontFamily.HELVETICA, 12);
			        doc.add(new Paragraph("작성자: " + req.getUserId(), infoFont));
			        doc.add(new Paragraph("기간: " + req.getPeriod(), infoFont));
			        doc.add(new Paragraph(" "));
			    }

			    private void addSection(Document doc, String title, String content) throws DocumentException {
			        Font sectionTitleFont = new Font(Font.FontFamily.HELVETICA, 13, Font.BOLD);
			        Font contentFont = new Font(Font.FontFamily.HELVETICA, 12);

			        Paragraph sectionTitle = new Paragraph(title, sectionTitleFont);
			        sectionTitle.setSpacingBefore(15f);
			        sectionTitle.setSpacingAfter(5f);

			        Paragraph sectionContent = new Paragraph(content, contentFont);
			        sectionContent.setSpacingAfter(10f);
			        sectionContent.setIndentationLeft(10f);

			        doc.add(sectionTitle);
			        doc.add(sectionContent);
			    }

			
				private void generateSummaryStyle(Document doc, ReportRequest req) throws DocumentException {
				    addTitle(doc, "📘 종합 보고서");
				    addInfo(doc, req);
				    addSection(doc, "1. 전반적 사고 개요", req.getSection1());
				    addSection(doc, "2. 부서별 주요 이슈", req.getSection2());
				    addSection(doc, "3. 대응 결과 요약", req.getSection3());
				    addSection(doc, "4. 교육/관리 계획", req.getSection4());
				    addSection(doc, "5. 특이사항", req.getSection5());
				}

				private void generateIncidentStyle(Document doc, ReportRequest req) throws DocumentException {
				    addTitle(doc, "⚠️ 사고 발생 보고서");
				    addInfo(doc, req);
				    addSection(doc, "1. 사고 개요", req.getSection1());
				    addSection(doc, "2. 발생 원인", req.getSection2());
				    addSection(doc, "3. 즉시 조치 내용", req.getSection3());
				    addSection(doc, "4. 재발 방지 대책", req.getSection4());
				    addSection(doc, "5. 참고/이미지 자료", req.getSection5());
				}

				private void generateInspectionStyle(Document doc, ReportRequest req) throws DocumentException {
				    addTitle(doc, "✅ 점검 결과 보고서");
				    addInfo(doc, req);
				    addSection(doc, "1. 점검 개요", req.getSection1());
				    addSection(doc, "2. 점검 항목 요약", req.getSection2());
				    addSection(doc, "3. 이상 징후", req.getSection3());
				    addSection(doc, "4. 조치 및 권고", req.getSection4());
				    addSection(doc, "5. 종합 의견", req.getSection5());
				}
		
}
