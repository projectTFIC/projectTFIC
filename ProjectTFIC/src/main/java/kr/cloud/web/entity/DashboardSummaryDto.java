package kr.cloud.web.entity;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class DashboardSummaryDto {
	private int todayAccident;
	private int accidentDiff;
	private int todayEquipment;
	private int equipmentDiff;
	private int todayPpe;
	private int ppeDiff;
	private int todayEvent;
	private int eventDiff;

	// 생성자, getter, setter
}
