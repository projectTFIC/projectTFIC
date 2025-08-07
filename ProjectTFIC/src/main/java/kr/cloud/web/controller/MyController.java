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
import org.springframework.web.bind.annotation.ResponseBody;
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
   
   
   // [ 영상장비 리스트 조회하기 ]
   @CrossOrigin(origins = "http://localhost:3000") 
   @GetMapping("/GetDevicesList")
   @ResponseBody // JSON 으로 값 반환
   public List<Devices> getDevicesList() {
	   
       return mapper.selectDevicesAll();
       
   }
   
}
