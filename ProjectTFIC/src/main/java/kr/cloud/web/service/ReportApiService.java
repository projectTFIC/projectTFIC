package kr.cloud.web.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.cloud.web.entity.Report;
import kr.cloud.web.mapper.ReportMapper;

import java.util.Date;
import java.util.List;

@Service
public class ReportApiService {
    @Autowired
    private ReportMapper reportMapper;

    public List<Report> getReportsByPeriod(Date start, Date end) {
        return reportMapper.selectReportsByPeriod(start, end);
    }

    public Report getReportById(int reportId) {
        return reportMapper.selectReportById(reportId);
    }

    public List<Report> getAllReports() {
        return reportMapper.selectAllReports();
    }
}