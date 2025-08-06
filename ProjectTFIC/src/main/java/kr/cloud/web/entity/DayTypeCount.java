package kr.cloud.web.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.Map;

//StatisticsResponse [Entity] 와 연동됨

@Data
@AllArgsConstructor
public class DayTypeCount {
	private String date; // ex: 2025-07-28
	private Map<String, Integer> typeCounts; // {사고 감지: 2, 안전장비 미착용: 1, 입출입: 2}
}
