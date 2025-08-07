package kr.cloud.web.entity;


import java.util.Date;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@NoArgsConstructor
@AllArgsConstructor
@Data
public class PpeRecordViewDto {

	// [ ppeRecordViewDto 클래스 ]
	// 안전장비 착용여부 탐지 정보를 기반으로 기록관리 게시판에 저장되는 기록 데이터 클래스
	
	// ㅇ 게시판 목록에 필요한 데이터
	private int recordId;       							// 게시글 번호 (ppe_record 테이블 PK)
    private String recordTitle; 							// 게시글 제목
    private final String detectionType = "안전장비 미착용";		// 탐지 유형
    
    @JsonFormat(pattern = "yy/MM/dd") 					// 날짜 형식 설정
    private Date regDate;       						// 탐지 날짜
    
    // ㅇ 상세보기에 필요한 데이터
    private String originalImg; 			// 원본 이미지 URL
    private String detectImg;   			// 감지 이미지 URL
    private String content;
    
	private int helmetOff;					// 안전모 미착용
	private int hookOff;					// 안전고리 미결착
	private int beltOff;					// 안전밸트 미착용
	private int shoesOff;					// 안전화 미착용
    
	
}