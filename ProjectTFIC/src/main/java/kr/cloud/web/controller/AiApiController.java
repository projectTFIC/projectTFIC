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

import kr.cloud.web.service.PpeRecordService;
import kr.cloud.web.dto.AccRecordDto;
import kr.cloud.web.dto.AccRecordViewDto;
import kr.cloud.web.dto.HeRecordDto;
import kr.cloud.web.dto.HeRecordViewDto;
import kr.cloud.web.dto.PpeRecordDto;
import kr.cloud.web.dto.PpeRecordViewDto;
import kr.cloud.web.service.AccRecordService;
import kr.cloud.web.service.HeRecordService;
import lombok.RequiredArgsConstructor;

//@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/aiapi")
@RequiredArgsConstructor
public class AiApiController {
	
	// [ AI / API Controller ]
	// AI 와 API 를 활용한 기능과 관련된 컨트롤러
	
	// ㅇ AI / API 중장비 기능 처리 객체
	private final PpeRecordService ppeRecordService;
	private final HeRecordService heRecordService;
	private final AccRecordService accRecordService;
	
	// =================================================================
	// 			안전장비 출입 (Personal Protect Equipment)
	// =================================================================
	
	// [ 안전장비 착용여부 : 객체 탐지 기능 요청 ]
    @PostMapping("/ppe-records")
    public ResponseEntity<String> createPpeRecord(@RequestBody PpeRecordDto ppeRecordDto) {
        
    	try {
        	// 1. 안전장비 기능 처리 객체를 사용하여 기록저장
            ppeRecordService.savePpeRecord(ppeRecordDto);
            
            // 2. 성공적으로 완료된 경우, python 에게 성공 신호와 메시지 전송
            return ResponseEntity.status(HttpStatus.CREATED).body("기록이 성공적으로 생성되었습니다.");
            
        } catch (Exception e) {
        	
        	// 3. 에러가 발생한 경우, 에러 내용을 출력 + python 에게 에러 신호와 메시지 전송
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("기록 생성 중 오류 발생: "+ e.getMessage());
            
        }
    	
    }
	
    
	// =================================================================
	// 				중장비 출입 (Heavy Equipment)
	// =================================================================
	
	// [ 중장비 출입 : 객체 탐지 기능 요청 ]
    @PostMapping("/he-records")
    public ResponseEntity<String> createHeRecord(@RequestBody HeRecordDto heRecordDto) {
        
    	try {
            // 1. 중장비 기능 처리 객체를 사용하여 기록 저장
            heRecordService.saveHeRecord(heRecordDto);

            // 2. 성공적으로 완료된 경우, python 에게 성공 신호와 메시지 전송
            return ResponseEntity.status(HttpStatus.CREATED).body("기록이 성공적으로 생성되었습니다.");

        } catch (Exception e) {
            // 3. 에러가 발생한 경우, 에러 내용을 출력 + python 에게 에러 신호와 메시지 전송            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("기록 생성 중 오류 발생: "  + e.getMessage());
            
        }
    	
    }
    
    
	// =================================================================
	// 				사고 감지 (Accident)
	// =================================================================
    
	// [ 사고 감지 : 기능 요청 ]
    @PostMapping("/acc-records")
    public ResponseEntity<String> createAccRecord(@RequestBody AccRecordDto accRecordDto) {
    	
        try {
        	// 1. 사고 기능 처리 객체를 사용하여 기록 저장
            accRecordService.saveAccRecord(accRecordDto);
            
            // 2. 성공적으로 완료된 경우, python 에게 성공 신호와 메시지 전송
            return ResponseEntity.status(HttpStatus.CREATED).body("기록이 성공적으로 생성되었습니다.");
            
        } catch (Exception e) {
        	// 3. 에러가 발생한 경우, 에러 내용을 출력 + python 에게 에러 신호와 메시지 전송
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("기록 생성 중 오류 발생: " + e.getMessage());
            
        }
        
    }

}
