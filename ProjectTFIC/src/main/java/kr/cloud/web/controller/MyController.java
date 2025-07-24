package kr.cloud.web.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

import jakarta.servlet.http.HttpSession;
import kr.cloud.web.ProjectTFICApplication;
import kr.cloud.web.entity.Devices;
import kr.cloud.web.entity.Users;
import kr.cloud.web.mapper.BoardMapper;


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
	

}
