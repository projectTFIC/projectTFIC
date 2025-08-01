package kr.cloud.web.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@NoArgsConstructor
@AllArgsConstructor
@Data
public class HeRecord {
	
	// [ he_record 테이블 ]
	// 객체 탐지 : 중장비 출입 정보를 기록하는 테이블
	
	private int recordId;			// 기록 아이디
	private String recordTitle;		// 기록 제목	
	private int typeId;				// 기능 아이디
	private String originalImg;		// 원본 이미지
	private String detectImg;		// 감지 이미지
	private int heType;				// 장비 유형
	private String heNumber;		// 번호판
	private String access;			// 입출입

}
