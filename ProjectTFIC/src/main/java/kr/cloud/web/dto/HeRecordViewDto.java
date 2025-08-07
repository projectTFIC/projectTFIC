package kr.cloud.web.dto;


import java.util.Date;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@NoArgsConstructor
@AllArgsConstructor
@Data
public class HeRecordViewDto {

	// [ HeRecordViewDto 클래스 ]
	// 중장비 출입 탐지 정보를 기반으로 기록관리 게시판에 저장되는 기록 데이터 클래스
	
	// ㅇ 게시판 목록에 필요한 데이터
	private int recordId;       						// 게시글 번호 (he_record 테이블 PK)
    private String recordTitle; 						// 게시글 제목
    private final String detectionType = "중장비 출입";	// 탐지 유형
    
    @JsonFormat(pattern = "yy/MM/dd") 					// 날짜 형식 설정
    private Date regDate;       						// 탐지 날짜
    
    // ㅇ 상세보기에 필요한 데이터
    private String originalImg; 			// 원본 이미지 URL
    private String detectImg;   			// 감지 이미지 URL
    private String heType;      			// 중장비 유형
    private String heNumber;    			// 번호판
    private String access;      			// 입출입
    
    // ㅇ 기타 필요한 데이터
    private String deviceId;      			// 장치 ID (type_info.device_id)
    private String location;      			// 설치 위치 (type_info.location)
    
}