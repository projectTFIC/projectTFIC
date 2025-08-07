package kr.cloud.web.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class LogHistoryItemDto {
    private String category;    // "accident", "safety-violation", "equipment-access"
    private String label;       // "사고 감지", "미착용 감지", "입출입 감지"
    private String message;     // 고정 메시지
    private String location;    // type_info.location
    private String name;        // devices.device_name  (카메라명)
    private String chipValue;   // 각 감지별 칩에 들어갈 값 (record_title 또는 he_number)
    private String time;        // 시간
}
