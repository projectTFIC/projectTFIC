package kr.cloud.web.controller;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
	@RequestMapping("/api/report")
	public class ReportController {
	    @Autowired
	    private ReportApiService reportService;

	    // 기간별 조회 (ex: /api/report/period?start=2024-01-01&end=2024-07-24)
	    @GetMapping("/period")
	    public List<Report> getReportsByPeriod(
	            @RequestParam("start") @DateTimeFormat(pattern="yyyy-MM-dd") Date start,
	            @RequestParam("end") @DateTimeFormat(pattern="yyyy-MM-dd") Date end) {
	        return reportService.getReportsByPeriod(start, end);
	    }

	    // 단건조회 (ex: /api/report/123)
	    @GetMapping("/{reportId}")
	    public Report getReportById(@PathVariable int reportId) {
	        return reportService.getReportById(reportId);
	    }

	    // 전체 조회
	    @GetMapping("/all")
	    public List<Report> getAllReports() {
	        return reportService.getAllReports();
	    }
	}
	
	
	
	// [유저 페이지 - 로그인]
	// 로그인 기능 
	@PostMapping("/GoLogin")
	public String goLogin(HttpSession session ,Users login) {
		
		Users logininfo = mapper.gologin(login);
		
		if (logininfo != null) {
			session.setAttribute("loginUser", logininfo);
			return "DashBoard";
		}else {
			return "GoLogin";
		}
	}
	
	
	// [유저 페이지 - 로그아웃]
	// 로그아웃 기능
	@GetMapping("/logout")
	public String logout(HttpSession session) {
	    session.invalidate(); // 현재 사용자 세션 완전 삭제
	    return "main";  // 로그아웃 후 메인 또는 로그인 페이지 등으로 리다이렉트
	    
	}
	
	
	// [유저 페이지 - 회원가입]
	// 회원가입 기능
	@PostMapping("/GoRegister")
	public String register(Users info, Model model) {
		
		int cnt = mapper.goRegister(info);
		
		if (cnt > 0) {
			return "main";
		}else {
			model.addAttribute("errorMsg", "회원가입에 실패했습니다.");
			return "register";
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
	
	


}
