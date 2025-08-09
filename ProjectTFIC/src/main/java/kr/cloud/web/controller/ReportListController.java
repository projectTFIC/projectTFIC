package kr.cloud.web.controller;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.cloud.web.entity.Report;
import kr.cloud.web.service.ReportListService;

//@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/reportlist")
public class ReportListController {

    @Autowired
    private ReportListService reportApiService;

    @GetMapping
    public List<Report> getAllReports() {
        return reportApiService.getAllReports();
    }

    @GetMapping("/search")
    public List<Report> getReportsByPeriod(@RequestParam("start") @DateTimeFormat(pattern = "yyyy-MM-dd") Date start,
                                           @RequestParam("end") @DateTimeFormat(pattern = "yyyy-MM-dd") Date end) {
        return reportApiService.getReportsByPeriod(start, end);
    }

    @GetMapping("/download")
    public ResponseEntity<Resource> downloadReportFile(@RequestParam String fileName) {
        try {
            Path filePath = Paths.get("/your/file/storage/path").resolve(fileName).normalize();
            if (!Files.exists(filePath) || !Files.isReadable(filePath)) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new UrlResource(filePath.toUri());

            String contentDisposition = "attachment; filename=\"" + resource.getFilename() + "\"";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
                    .body(resource);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
