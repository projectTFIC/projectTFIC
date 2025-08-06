package kr.cloud.web.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "ppe_content")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class PpeContent {
	
	// [ ppe_content 테이블 ]
	// 객체 탐지 : 안전장비 탐지 결과의 세부정보를 기록하는 테이블
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY) 
	@Column(name = "content_id")
	private int contentId;			// 정보 아이디
	
	@Column(name = "record_id")
	private int recordId;			// 기록 아이디
	
	@Column(name = "content")
	private String content;			// 세부 정보	
	
	@Column(name = "helmet_off")
	private int helmetOff;			// 안전모 미착용
	
	@Column(name = "hook_off")
	private int hookOff;			// 안전고리 미결착
	
	@Column(name = "belt_off")
	private int beltOff;			// 안전밸트 미착용
	
	@Column(name = "shoes_off")
	private int shoesOff;			// 안전화 미착용

}
