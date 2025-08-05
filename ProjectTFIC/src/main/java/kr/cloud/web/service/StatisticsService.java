package kr.cloud.web.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import org.springframework.stereotype.Service;

import kr.cloud.web.entity.DayTypeCount;
import kr.cloud.web.entity.StatisticsResponse;
import kr.cloud.web.entity.TypeCount;
import kr.cloud.web.mapper.NoticeMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final NoticeMapper reportRepository;

    public StatisticsResponse getStatistics(String start, String end) {
        LocalDateTime startDateTime = LocalDate.parse(start, DateTimeFormatter.ISO_DATE).atStartOfDay();
        LocalDateTime endDateTime = LocalDate.parse(end, DateTimeFormatter.ISO_DATE).plusDays(1).atStartOfDay(); // inclusive

        // 1. 유형별 집계
        List<Object[]> typeStatsRaw = reportRepository.getTypeStats(startDateTime, endDateTime);
        List<TypeCount> typeStats = new ArrayList<>();
        for (Object[] row : typeStatsRaw) {
            typeStats.add(new TypeCount((String) row[0], ((Number) row[1]).intValue()));
        }

        // 2. 일별, 유형별 집계
        List<Object[]> dayTypeStatsRaw = reportRepository.getDayTypeStats(startDateTime, endDateTime);
        // day → {type → count}
        Map<String, Map<String, Integer>> dayMap = new TreeMap<>();
        for (Object[] row : dayTypeStatsRaw) {
            String day = row[0].toString();
            String type = (String) row[1];
            int count = ((Number) row[2]).intValue();
            dayMap.computeIfAbsent(day, k -> new HashMap<>()).put(type, count);
        }
        List<DayTypeCount> dayStats = new ArrayList<>();
        for (String day : dayMap.keySet()) {
            dayStats.add(new DayTypeCount(day, dayMap.get(day)));
        }

        // 3. 구역별, 일별, 유형별 집계
        List<Object[]> areaDayTypeStatsRaw = reportRepository.getAreaDayTypeStats(startDateTime, endDateTime);
        // location → list of {date, {type, count}}
        Map<String, Map<String, Map<String, Integer>>> areaMap = new LinkedHashMap<>();
        for (Object[] row : areaDayTypeStatsRaw) {
            String location = row[0].toString();
            String day = row[1].toString();
            String type = (String) row[2];
            int count = ((Number) row[3]).intValue();
            areaMap.computeIfAbsent(location, k -> new TreeMap<>())
                .computeIfAbsent(day, k -> new HashMap<>())
                .put(type, count);
        }
        Map<String, List<DayTypeCount>> areaStats = new LinkedHashMap<>();
        for (String location : areaMap.keySet()) {
            List<DayTypeCount> list = new ArrayList<>();
            for (String day : areaMap.get(location).keySet()) {
                list.add(new DayTypeCount(day, areaMap.get(location).get(day)));
            }
            areaStats.put(location, list);
        }

        // 통합 결과
        StatisticsResponse response = new StatisticsResponse();
        response.setTypeStats(typeStats);
        response.setDayStats(dayStats);
        response.setAreaStats(areaStats);
        return response;
    }
}
