package kr.cloud.web.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@NoArgsConstructor
@AllArgsConstructor
@Data
public class PpeContent {
	
	// [ ppe_content 테이블 ]
	// 객체 탐지 : 안전장비 탐지 결과의 세부정보를 기록하는 테이블
	
	private int contentId;			// 정보 아이디
	private int recordId;			// 기록 아이디
	private String content;			// 세부 정보	
	private int helmetOff;			// 안전모 미착용
	private int hookOff;			// 안전고리 미결착
	private int beltOff;			// 안전밸트 미착용
	private int shoesOff;			// 안전화 미착용

}
