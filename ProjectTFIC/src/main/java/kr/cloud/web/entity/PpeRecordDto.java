package kr.cloud.web.entity;


import java.util.Date;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@NoArgsConstructor
@AllArgsConstructor
@Data
public class PpeRecordDto {

	// [ PpeRecordDto 클래스 ]
	// python 으로부터 전달받은 JSON 데이터를 저장하는 데이터 전송 클래스
    private int deviceId;
	private int helmetOff;			// 안전모 미착용
	private int hookOff;			// 안전고리 미결착
	private int beltOff;			// 안전밸트 미착용
	private int shoesOff;			// 안전화 미착용

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")    // 해당 형식의 문자열을 Date로 변환
    private Date regDate;
    
    private String originalImg;
    private String detectImg;
    private String content;
    
}