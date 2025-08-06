package kr.cloud.web.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccidentListItemDto {
    private Long id;
    private String title;
    private String type;
    private String location;
    private String date;
    private String access;
    private String detectImg; 
}