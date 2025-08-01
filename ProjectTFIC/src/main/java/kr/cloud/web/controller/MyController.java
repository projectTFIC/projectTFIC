package kr.cloud.web.controller;

import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpSession;
import kr.cloud.web.ProjectTFICApplication;
import kr.cloud.web.entity.Devices;

import kr.cloud.web.entity.Report;
import kr.cloud.web.entity.TypeInfo;

import kr.cloud.web.entity.Users;
import kr.cloud.web.mapper.BoardMapper;
import kr.cloud.web.service.ReportApiService;


@Controller
public class MyController {

   private final ProjectTFICApplication projectTficApplication;

   MyController(ProjectTFICApplication projectTficApplication) {

      this.projectTficApplication = projectTficApplication;

   }

   // ㅇ mapper 객체 사용
   @Autowired
   BoardMapper mapper;

   // [ 모니터링 페이지 - 영상장비 리스트 ]
   // 등록된 영상장비의 리스트를 출력하는 기능
   @GetMapping("/GoMonitoring")
   public String goMonitoring(Model model) {

      List<Devices> devicelist = mapper.selectDevicesAll();

      model.addAttribute("devicelist", devicelist);

      return "Monitoring";

   }

   @RestController
   @RequestMapping("/ai")
   @CrossOrigin(origins = "http://localhost:5001") // AI 서버 주소 허용
   public class ViolationReportController {

      // Object Storage 서비스 로직이 주입되었다고 가정
      // private final ObjectStorageService objectStorageService;

      /**
       * AI 서버로부터 위반 보고(이미지 파일 + 메타데이터)를 받습니다.
       * 
       * @param imageFile     실제 이미지 파일
       * @param violationType 위반 종류 (문자열)
       * @param timestamp     발생 시각 (문자열)
       * @param deviceLabel   발생 장치 (문자열)
       * @return
       */
      @PostMapping("/report-violation")
      public ResponseEntity<String> reportViolation(@RequestParam("imageFile") MultipartFile imageFile,
            @RequestParam("violationType") String violationType, @RequestParam("timestamp") String timestamp,
            @RequestParam("deviceLabel") String deviceLabel) {

         if (imageFile.isEmpty()) {
            return ResponseEntity.badRequest().body("이미지 파일이 비어있습니다.");
         }

         try {
            // 여기에서 Object Storage 업로드 로직을 호출합니다.
            // String fileUrl = objectStorageService.upload(imageFile, violationType);

            // 임시로 파일 정보와 메타데이터를 출력하는 예시
            System.out.println("===== 위반 보고 접수 =====");
            System.out.println("파일 이름: " + imageFile.getOriginalFilename());
            System.out.println("파일 크기: " + imageFile.getSize() + " bytes");
            System.out.println("위반 종류: " + violationType);
            System.out.println("발생 시각: " + timestamp);
            System.out.println("발생 장치: " + deviceLabel);
            System.out.println("=======================");

            // DB에 위반 기록 저장 로직
            // reportService.saveReport(fileUrl, violationType, timestamp);

            // 클라이언트에게 성공 응답과 함께 Object Storage에 업로드된 URL을 반환할 수 있습니다.
            return ResponseEntity.ok("보고서가 성공적으로 접수되었습니다. 파일: " + imageFile.getOriginalFilename());

         } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("보고 처리 중 오류 발생: " + e.getMessage());
         }
      }
   }

   // [유저 페이지 - 로그인]
   // 로그인 기능
   @CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
   @PostMapping("/GoLogin")
   public ResponseEntity<?> goLogin(HttpSession session, @RequestBody Users login) {

      Users logininfo = mapper.gologin(login);

      if (logininfo != null) {
         session.setAttribute("loginUser", logininfo);
         return ResponseEntity.ok(logininfo); // 로그인 성공 유저 정보 JSON 응답
      } else {
         return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
               .body(Collections.singletonMap("message", "Login Failed"));
      }
   }

   // [유저 페이지 - 로그아웃]
   // 로그아웃 기능
   @CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
   @GetMapping("/logout")
   public ResponseEntity<String> logout(HttpSession session) {
       session.invalidate();
       return ResponseEntity.ok("로그아웃 성공");
   }


   // [유저 페이지 - 회원가입]
   // 회원가입 기능
   @PostMapping("/GoRegister")
   @CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
   public ResponseEntity<?> register(@RequestBody Users info) {
       int cnt = mapper.goRegister(info);

       if (cnt > 0) {
           // 회원가입 성공
           // JSON body로 성공 메시지를 보낼 수도 있음
           return ResponseEntity.ok(Collections.singletonMap("message", "회원가입 성공"));
       } else {
           // 회원가입 실패
           return ResponseEntity.status(HttpStatus.BAD_REQUEST)
               .body(Collections.singletonMap("error", "회원가입에 실패했습니다."));
       }
   }

   // [회원가입 - 중복 아이디 확인]
   // 중복 아이디 확인
   @RestController
   @CrossOrigin(origins = "http://localhost:3000")
   @RequestMapping("/api")
   public class UserController {

      @Autowired
      private BoardMapper mapper;

      // 아이디 중복 확인 API
      @PostMapping("/usersidcheck")
      public Map<String, Boolean> checkUsername(@RequestBody Map<String, String> payload) {
         String user_id = payload.get("user_id");
         int cnt = mapper.countByUserId(user_id);
         boolean isAvailable = cnt == 0;

         Map<String, Boolean> result = new HashMap<>();
         result.put("isAvailable", isAvailable);
         return result;
      }

   }

   // [알람 페이지 - 전체 알람 조회 기능]
   // 전체 알람에 관한 리스트를 최신순 기준으로 받아음
   @GetMapping("/Golist")
   public String home(Model model, HttpSession session) {
      // 로그인 정보가 있는지 확인하는 과정
      Users loginUser = (Users) session.getAttribute("loginUser");
      if (loginUser == null) {
         // 로그인 정보가 없으면 로그인 페이지로 리다이렉트
         return "redirect:/GoLogin"; // 로그인 화면의 엔드포인트를 실제 경로에 맞게 수정
      }
      // List 값으로 type_info 테이블에 있는 값 전부 가지고 오기
      List<TypeInfo> TypeInfoList = mapper.selectAll();
      model.addAttribute("TypeInfoList", TypeInfoList);

      return "list";
   }

   @RestController
   @RequestMapping("/reports")
   @CrossOrigin(origins = "http://localhost:3000")
   public class ReportController {

      @Autowired
      private ReportApiService reportApiService;

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
      public List<Report> getReportsByPeriod(
            @RequestParam("start") @DateTimeFormat(pattern = "yyyy-MM-dd") Date start,
            @RequestParam("end") @DateTimeFormat(pattern = "yyyy-MM-dd") Date end) {
         return reportApiService.getReportsByPeriod(start, end);
      }
   }
}
