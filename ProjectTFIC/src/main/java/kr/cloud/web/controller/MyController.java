package kr.cloud.web.controller;

import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpSession;
import kr.cloud.web.ProjectTFICApplication;
import kr.cloud.web.entity.Devices;
import kr.cloud.web.entity.ImageUploadRequest;
import kr.cloud.web.entity.TypeInfo;
import kr.cloud.web.entity.UsernameCheckRequestDto;
import kr.cloud.web.entity.Users;
import kr.cloud.web.mapper.BoardMapper;
import kr.cloud.web.service.UserService;
import lombok.RequiredArgsConstructor;


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
	@RequestMapping("/api")
	// React 앱(localhost:3000)에서의 요청을 허용하기 위한 CORS 설정
	@CrossOrigin(origins = "http://localhost:3000")
	public class FileUploadController {

	    @PostMapping("/upload")
	    public ResponseEntity<String> uploadImage(@RequestBody ImageUploadRequest request) {
	        // imageData는 "data:image/png;base64,iVBORw0go..." 형식이므로, 실제 데이터 부분만 분리합니다.
	        String[] parts = request.getImageData().split(",");
	        if (parts.length != 2) {
	            return ResponseEntity.badRequest().body("잘못된 이미지 데이터 형식입니다.");
	        }
	        
	        String imageString = parts[1];
	        byte[] imageBytes = Base64.getDecoder().decode(imageString);

	        try {
	            // "uploads" 폴더 아래에 label 이름으로 된 하위 폴더를 생성합니다.
	            Path uploadPath = Paths.get("uploads", request.getLabel());
	            if (!Files.exists(uploadPath)) {
	                Files.createDirectories(uploadPath);
	            }

	            // 파일 이름은 현재 시간(timestamp)을 사용하여 고유하게 만듭니다.
	            String fileName = System.currentTimeMillis() + ".png";
	            Path filePath = uploadPath.resolve(fileName);

	            // 파일을 저장합니다.
	            try (FileOutputStream fos = new FileOutputStream(filePath.toFile())) {
	                fos.write(imageBytes);
	            }

	            return ResponseEntity.ok("업로드 성공: " + filePath.toString());

	        } catch (IOException e) {
	            e.printStackTrace();
	            return ResponseEntity.internalServerError().body("업로드 실패: " + e.getMessage());
	        }
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
	
	// [회원가입 - 중복 아이디 확인]
	// 중복 아이디 확인 
	@RestController
	@RequestMapping("/api/v1/users")
	@RequiredArgsConstructor // final 필드에 대한 생성자 주입
	public class UserController {

	    private final UserService userService;

	    // 아이디 중복 확인 요청을 처리하는 핸들러
	    @PostMapping("/check-username")
	    public ResponseEntity<Map<String, Boolean>> checkUsername(@RequestBody UsernameCheckRequestDto requestDto) {
	        // 서비스 레이어를 호출하여 아이디 중복 여부 확인
	        boolean isAvailable = !userService.isUsernameDuplicated(requestDto.getUsername());

	        // 결과를 Map 객체에 담아 JSON으로 반환
	        Map<String, Boolean> response = new HashMap<>();
	        response.put("isAvailable", isAvailable);

	        return ResponseEntity.ok(response);
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
