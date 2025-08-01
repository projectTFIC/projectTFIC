package kr.cloud.web.service;

import java.sql.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.cloud.web.entity.Report;
import kr.cloud.web.mapper.BoardMapper;


@Service
public class ReportListService {

    @Autowired
    private BoardMapper reportMapper;

    public List<Report> getAllReports() {
        return reportMapper.getAllReports();
    }

    public List<Report> getReportsByPeriod(Date start, Date end) {
        return reportMapper.getReportsByPeriod(start, end);
    }
}
