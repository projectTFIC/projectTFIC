package kr.cloud.web.controller;

import kr.cloud.web.entity.AccidentListItemDto;
import kr.cloud.web.entity.DashboardSummaryDto;
import kr.cloud.web.entity.LogHistoryItemDto;
import kr.cloud.web.entity.StatisticsResponse;
import kr.cloud.web.service.AccidentService;
import kr.cloud.web.service.DashboardService;
import kr.cloud.web.service.StatisticsService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import java.util.List;

// 기록관리 및 통계 컨트롤러

@RestController
@RequiredArgsConstructor
@RequestMapping("/tablelist")
@CrossOrigin(origins = "http://localhost:3000")
public class TablesController {
	private final AccidentService accidentService;
	private final StatisticsService statisticsService;
	private final DashboardService dashboardService;

	@GetMapping("/accidents")
	public List<AccidentListItemDto> getAccidents() {
		return accidentService.getAllAccidents();
	}

	@GetMapping("/equipment")
	public List<AccidentListItemDto> getPpe() {
		return accidentService.getAllPpe();
	}

	@GetMapping("/access")
	public List<AccidentListItemDto> getAccess() {
		return accidentService.getAccess();
	}

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
