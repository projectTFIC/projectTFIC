package kr.cloud.web.mapper;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface DashboardMapper {
    int countTodayAccident();
    int countLastWeekAccident();
    int countTodayEquipment();
    int countLastWeekEquipment();
    int countTodayPpe();
    int countLastWeekPpe();
    int countTodayEvent();
	int countLastWeekEvent();
}

