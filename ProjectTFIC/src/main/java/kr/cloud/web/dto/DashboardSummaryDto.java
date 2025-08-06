package kr.cloud.web.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class DashboardSummaryDto {
    private int todayAccident;
    private int accidentDiff;    // % (지난주 대비)
    private int yesterdayAccidentDiff; //   (어제 대비 건수)
    private int todayEquipment;
    private int equipmentDiff;
    private int yesterdayEquipmentDiff; // 추가
    private int todayPpe;
    private int ppeDiff;
    private int yesterdayPpeDiff; // 추가
    private int todayEvent;
    private int eventDiff;
    private int yesterdayEventDiff; // 추가

    // ... 생성자, getter/setter 등 생략
}
