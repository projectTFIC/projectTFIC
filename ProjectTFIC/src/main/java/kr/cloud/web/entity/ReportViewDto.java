package kr.cloud.web.entity;

import lombok.Data;

@Data
public class ReportViewDto {

    private Long reportId;
    private String reportTitle;
    private String reportFile;

    private String userId;
    private String name;

    private String typeRecord; // from type_info
    private String location;   // from type_info

    private String regDate; // 조인된 type_info.reg_date (문자열로 출력)

}
