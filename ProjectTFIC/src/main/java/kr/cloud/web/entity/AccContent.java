package kr.cloud.web.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@NoArgsConstructor
@AllArgsConstructor
@Data
public class AccContent {
	
	// [ acc_content 테이블 ]
	// 자세 인식 : 사고감지 결과의 세부정보를 기록하는 테이블
	
	private int contentId;			// 정보 아이디
	private int recordId;			// 기록 아이디
	private String content;			// 세부 정보	

}
