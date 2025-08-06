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
        int yesterdayAccident = dashboardMapper.countYesterdayAccident();
        int accidentDiff = calculateDiff(todayAccident, lastWeekAccident);
        int yesterdayAccidentDiff = todayAccident - yesterdayAccident;

        // 나머지 항목도 동일하게 호출
        int todayEquipment = dashboardMapper.countTodayEquipment();
        int lastWeekEquipment = dashboardMapper.countLastWeekEquipment();
        int yesterdayEquipment = dashboardMapper.countYesterdayEquipment();
        int equipmentDiff = calculateDiff(todayEquipment, lastWeekEquipment);
        int yesterdayEquipmentDiff = todayEquipment - yesterdayEquipment;

        int todayPpe = dashboardMapper.countTodayPpe();
        int lastWeekPpe = dashboardMapper.countLastWeekPpe();
        int yesterdayPpe = dashboardMapper.countYesterdayPpe();
        int ppeDiff = calculateDiff(todayPpe, lastWeekPpe);
        int yesterdayPpeDiff = todayPpe - yesterdayPpe;

        int todayEvent = dashboardMapper.countTodayEvent();
        int lastWeekEvent = dashboardMapper.countLastWeekEvent();
        int yesterdayEvent = dashboardMapper.countYesterdayEvent();
        int eventDiff = calculateDiff(todayEvent, lastWeekEvent);
        int yesterdayEventDiff = todayEvent - yesterdayEvent;
        
        
        return new DashboardSummaryDto(
                todayAccident, accidentDiff, yesterdayAccidentDiff,
                todayEquipment, equipmentDiff, yesterdayEquipmentDiff,
                todayPpe, ppeDiff, yesterdayPpeDiff,
                todayEvent, eventDiff, yesterdayEventDiff
            );
    }

    private int calculateDiff(int today, int lastWeek) {
        if (lastWeek == 0) return 0;
        return (int) Math.round((double)(today - lastWeek) / lastWeek * 100);
    }
}

