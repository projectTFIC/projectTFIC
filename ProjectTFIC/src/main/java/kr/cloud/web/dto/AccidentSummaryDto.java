package kr.cloud.web.dto;

import java.util.Date;
import lombok.Data;

@Data
public class AccidentSummaryDto {

    private String recordTitle;   // 사고 제목 (acc_record.record_title)
    private String content;       // 사고 상세 내용 (acc_content.content)
    private String location;      // 사고 위치 (type_info.location)
    private Date regDate;         // 사고 등록일 (type_info.reg_date)
    private String deviceId;      // 장치 ID (type_info.device_id)
    private String originalImg;   // 원본 이미지 (acc_record.original_img)
    private String detectImg;     // 감지 이미지 (acc_record.detect_img)
}