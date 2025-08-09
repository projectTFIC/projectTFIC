package kr.cloud.web.controller;

import kr.cloud.web.dto.AccRecordViewDto;
import kr.cloud.web.dto.DashboardSummaryDto;
import kr.cloud.web.dto.HeRecordViewDto;
import kr.cloud.web.dto.LogHistoryItemDto;
import kr.cloud.web.dto.PpeRecordViewDto;
import kr.cloud.web.entity.StatisticsResponse;
import kr.cloud.web.service.AccRecordService;
import kr.cloud.web.service.DashboardService;
import kr.cloud.web.service.HeRecordService;
import kr.cloud.web.service.PpeRecordService;
import kr.cloud.web.service.StatisticsService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import java.util.List;

// 기록관리 및 통계 컨트롤러

//@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequiredArgsConstructor
@RequestMapping("/tablelist")
public class TablesController {
	
	private final AccRecordService accRecordService;
	private final PpeRecordService ppeRecordService;
	private final HeRecordService heRecordService;
	
	private final DashboardService dashboardService;
	private final StatisticsService statisticsService;

	// =================================================================
	// 				사고 감지 (Accident)
	// =================================================================
	
    // [ 사고 감지 : 자세 인식 전체 기록 조회 ]
    @GetMapping("/accidents")
    public ResponseEntity<List<AccRecordViewDto>> getAllAccRecords() {
    	
    	// 1. 사고 감지와 관련된 전체 기록 가져오기
        List<AccRecordViewDto> records = accRecordService.selectAllAccRecords();
        
        // 2. 해당 기록을 성공적으로 가져온 경우, 성공 신호 전달
        return ResponseEntity.ok(records);
        
    }

    
    // [ 사고 감지 : 자세 인식 특정 기록 조회 ]
    @GetMapping("/accidents/{recordId}")
    public ResponseEntity<AccRecordViewDto> getAccRecordById(@PathVariable int recordId) {
    	
    	// 1. 사고 감지와 관련된 특정 기록 가져오기
    	AccRecordViewDto record = accRecordService.selectAccRecordById(recordId);
    	
    	// 2. 해당 기록을 성공적으로 가져온 경우, 성공 신호 전달
        return ResponseEntity.ok(record);
        
    }
	
    
	// =================================================================
	// 			안전장비 출입 (Personal Protect Equipment)
	// =================================================================
	
    // [ 안전장비 착용여부 : 객체 탐지 전체 기록 조회 ]
    @GetMapping("/equipments")
    public ResponseEntity<List<PpeRecordViewDto>> getAllPpeRecords() {
    	
        // 1. 안전장비 착용여부와 관련된 모든 기록 가져오기
        List<PpeRecordViewDto> records = ppeRecordService.selectAllPpeRecords();
        
        // 2. 기록 리스트를 성공적으로 가져온 경우, 성공 신호 전달
        return ResponseEntity.ok(records);
        
    }
    
    
    // [ 안전장비 착용여부 : 객체 탐지 특정 기록 조회 ]
    @GetMapping("/equipments/{recordId}")
    public ResponseEntity<PpeRecordViewDto> getPpeRecordById(@PathVariable int recordId) {

    	// 1. 안전장비 착용여부와 관련된 특정 기록 가져오기
    	PpeRecordViewDto record = ppeRecordService.selectPpeRecordById(recordId);
        
        // 2. 해당 기록을 성공적으로 가져온 경우, 성공 신호 전달
        return ResponseEntity.ok(record);
        
    }
	
    
	// =================================================================
	// 				중장비 출입 (Heavy Equipment)
	// =================================================================
	
    // [ 중장비 출입 : 객체 탐지 전체 기록 조회 ]
    @GetMapping("/access")
    public ResponseEntity<List<HeRecordViewDto>> getAllHeRecords() {
    	
        // 1. 중장비 출입과 관련된 모든 기록 가져오기
        List<HeRecordViewDto> records = heRecordService.selectAllHeRecords();
        
        // 2. 기록 리스트를 성공적으로 가져온 경우, 성공 신호 전달
        return ResponseEntity.ok(records);
        
    }
    
    
    // [ 중장비 출입 : 객체 탐지 특정 기록 조회 ]
    @GetMapping("/access/{recordId}")
    public ResponseEntity<HeRecordViewDto> getHeRecordById(@PathVariable int recordId) {
    	
    	// 1. 중장비 출입과 관련된 특정 기록 가져오기
        HeRecordViewDto record = heRecordService.selectHeRecordById(recordId);
        
        // 2. 해당 기록을 성공적으로 가져온 경우, 성공 신호 전달
        return ResponseEntity.ok(record);
    }
	
    
	// =================================================================
	// 								통계 정보
	// =================================================================
	
	@GetMapping("/statistics")
	public ResponseEntity<StatisticsResponse> getStatistics(@RequestParam("start") String start,
			@RequestParam("end") String end) {
		return ResponseEntity.ok(statisticsService.getStatistics(start, end));
	}

	
	@GetMapping("/summary")
	public ResponseEntity<DashboardSummaryDto> getDashboardSummary() {
		DashboardSummaryDto summary = dashboardService.getDashboardSummary();
		return ResponseEntity.ok(summary);
	}
	

	 @GetMapping("/logs")
	    public List<LogHistoryItemDto> getLatestLogs() {
	        return dashboardService.getLatestLogs();
	}
	
}
