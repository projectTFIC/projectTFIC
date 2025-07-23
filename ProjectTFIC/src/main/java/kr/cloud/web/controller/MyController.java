package kr.cloud.web.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import kr.cloud.web.ProjectTFICApplication;
import kr.cloud.web.entity.Devices;
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
	

}
