package kr.cloud.web.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController 
public class ReactController {
	
	// [ Spring Boot - React 연동 ]
	// Spring Boot 와 React 사이에 연동하며, 연결 성공 시 확인 가능
	@GetMapping("/api/connect")
	public String test() {
		 
		System.out.println("React에서 API 호출 성공!"); 		// 콘솔 확인용 로그
	    return "Spring Boot 연결 성공!";
        
    }
	
	
}	
