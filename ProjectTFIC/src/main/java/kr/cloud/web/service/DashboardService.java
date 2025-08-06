package kr.cloud.web.service;

import org.springframework.stereotype.Service;

import kr.cloud.web.entity.DashboardSummaryDto;
import kr.cloud.web.mapper.DashboardMapper;

@Service
public class DashboardService {

    private final DashboardMapper dashboardMapper;

    public DashboardService(DashboardMapper dashboardMapper) {
        this.dashboardMapper = dashboardMapper;
    }

    public DashboardSummaryDto getDashboardSummary() {
        int todayAccident = dashboardMapper.countTodayAccident();
        int lastWeekAccident = dashboardMapper.countLastWeekAccident();
        int accidentDiff = calculateDiff(todayAccident, lastWeekAccident);

        // 나머지 항목도 동일하게 호출
        int todayEquipment = dashboardMapper.countTodayEquipment();
        int lastWeekEquipment = dashboardMapper.countLastWeekEquipment();
        int equipmentDiff = calculateDiff(todayEquipment, lastWeekEquipment);

        int todayPpe = dashboardMapper.countTodayPpe();
        int lastWeekPpe = dashboardMapper.countLastWeekPpe();
        int ppeDiff = calculateDiff(todayPpe, lastWeekPpe);

        int todayEvent = dashboardMapper.countTodayEvent();
        int lastWeekEvent = dashboardMapper.countLastWeekEvent();
        int eventDiff = calculateDiff(todayEvent, lastWeekEvent);
        
        
        return new DashboardSummaryDto(
            todayAccident, accidentDiff,
            todayEquipment, equipmentDiff,
            todayPpe, ppeDiff,
            todayEvent, eventDiff
        );
    }

    private int calculateDiff(int today, int lastWeek) {
        if (lastWeek == 0) return 0;
        return (int) Math.round((double)(today - lastWeek) / lastWeek * 100);
    }
}

