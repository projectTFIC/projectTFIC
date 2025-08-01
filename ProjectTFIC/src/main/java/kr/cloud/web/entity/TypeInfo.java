package kr.cloud.web.entity;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@NoArgsConstructor
@AllArgsConstructor
@Data
public class TypeInfo {
	
	// [ 탐지기능 정보 테이블 ]
	// 탐지기능을 활용하여 얻은 기록 정보 (기록 및 보고서 내용과 연결하기 위한 허브)
	
	private int typeId;				// 기능 아이디
	private String typeRecord;		// 기능 제목
	private int deviceId;			// 장비 아이디
	private String location;		// 탐지장소
	private Date regDate;			// 탐지일시

}
