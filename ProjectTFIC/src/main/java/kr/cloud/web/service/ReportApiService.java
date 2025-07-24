package kr.cloud.web.service;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

public class ReportApiService {

    public String generateReport() {
        String flaskUrl = "http://192.168.219.176:5000/api/report/generate"; // Flask 서버 IP:PORT

        Map<String, Object> body = new HashMap<>();
        body.put("period_start", "2025-07-01");
        body.put("period_end", "2025-07-04");
        body.put("user_id", "testuser");
        body.put("report_type", "total");
        body.put("extra_note", "스프링에서 요청 테스트");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<Map> response = restTemplate.exchange(
            flaskUrl, HttpMethod.POST, entity, Map.class);

        Map<String, Object> resBody = response.getBody();
        return (String) resBody.get("report_html");
    }
}