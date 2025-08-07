package kr.cloud.web.entity;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class HeAccessDayCount {
	private String date; // 날짜
	private String access; // "입차"/"출차"
	private int count; // 건수
}


