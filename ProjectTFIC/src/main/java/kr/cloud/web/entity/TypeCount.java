package kr.cloud.web.entity;

import lombok.AllArgsConstructor;
import lombok.Data;

// StatisticsResponse [Entity] 와 연동됨
@Data
@AllArgsConstructor
public class TypeCount {
	private String type; // ex: 사고 감지
	private int count;
}
