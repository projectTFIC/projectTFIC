package kr.cloud.web.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.cloud.web.entity.Report;

import java.util.Date;
import java.util.List;

@Mapper
public interface  ReportMapper {
	  // 기간(등록일) 기준으로 조회
    List<Report> selectReportsByPeriod(@Param("start") Date start, @Param("end") Date end);

    // 필요하다면 단건/전체 조회 등도 추가 가능
    Report selectReportById(@Param("reportId") int reportId);
    List<Report> selectAllReports();
}
