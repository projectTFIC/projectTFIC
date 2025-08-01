package kr.cloud.web.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.cloud.web.entity.HeRecordDto;
import kr.cloud.web.entity.HeRecordViewDto;
import kr.cloud.web.service.HeRecordService;
import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/aiapi")
@RequiredArgsConstructor
public class AiApiController {
	
	// [ AI / API Controller ]
	// AI 와 API 를 활용한 기능과 관련된 컨트롤러
	
	// ㅇ AI / API 중장비 기능 처리 객체
	private final HeRecordService heRecordService;
	
	
	// [ 중장비 출입 : 객체 탐지 기능 요청 ]
    @PostMapping("/he-records")
    public ResponseEntity<String> createHeRecord(@RequestBody HeRecordDto heRecordDto) {
        
    	try {
            // 1. 중장비 기능 처리 객체를 사용하여 기록 저장
            heRecordService.saveHeRecord(heRecordDto);

            // 2. 성공적으로 완료된 경우, python 에게 성공 신호와 메시지 전송
            return ResponseEntity.status(HttpStatus.CREATED).body("Record created successfully.");

        } catch (Exception e) {
            // 3. 에러가 발생한 경우, 에러 내용을 출력 + python 에게 에러 신호와 메시지 전송
            System.out.println("Error creating record: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating record: " + e.getMessage());
            
        }
    	
    }
    
    
    // [ 중장비 출입 : 객체 탐지 전체 기록 조회 ]
    @GetMapping("/he-records")
    public ResponseEntity<List<HeRecordViewDto>> getAllHeRecords() {
    	
        // 1. 중장비 출입과 관련된 모든 기록 가져오기
        List<HeRecordViewDto> records = heRecordService.selectAllHeRecords();
        
        // 2. 기록 리스트를 성공적으로 가져온 경우, 성공 신호 전달
        return ResponseEntity.ok(records);
        
    }
    
    
    // [ 중장비 출입 : 객체 탐지 특정 기록 조회 ]
    @GetMapping("/he-records/{recordId}")
    public ResponseEntity<HeRecordViewDto> getHeRecordById(@PathVariable int recordId) {
    	
    	// 1. 중장비 출입과 관련된 특정 기록 가져오기
        HeRecordViewDto record = heRecordService.selectHeRecordById(recordId);
        
        // 2. 해당 기록을 성공적으로 가져온 경우, 성공 신호 전달
        return ResponseEntity.ok(record);
    }
    

}
