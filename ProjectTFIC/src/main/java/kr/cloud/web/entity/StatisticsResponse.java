package kr.cloud.web.entity;


import lombok.Data;
import java.util.List;
import java.util.Map;
// 통계 화면에서 사용하는 엔티티

@Data
public class StatisticsResponse {
    private List<TypeCount> typeStats;                // 유형별 집계
    private List<DayTypeCount> dayStats;              // 일별 집계
    private Map<String, List<DayTypeCount>> areaStats; // 구역별 집계
}
