package kr.cloud.web.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.cloud.web.dto.AccidentSummaryDto;
import kr.cloud.web.dto.HeRecordDto;
import kr.cloud.web.entity.Report;

import java.util.Date;
import java.util.List;

@Mapper
public interface  ReportMapper {
	// 게시판 관련
	List<Report> selectReportsByPeriod(@Param("start") Date start, @Param("end") Date end);
	Report selectReportById(@Param("reportId") int reportId);
	List<Report> selectAllReports();

	// 보고서 요약 관련
	List<AccidentSummaryDto> selectAccidentSummaryByPeriod(@Param("start") Date start, @Param("end") Date end);
	List<HeRecordDto> selectHeRecordsByPeriod(@Param("start") Date start, @Param("end") Date end);
	String getTotalSummaryByPeriod(@Param("start") Date start, @Param("end") Date end);
}
