package kr.cloud.web.entity;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@NoArgsConstructor
@AllArgsConstructor
@Data
public class TypeInfo {
	
	// [ Report 테이블 ]
	// 보고서 작성 관련 정보
	
	private int typeId;			// 타입 ID
	private String typeRecord;		// 레포트 제목	
	private String deviceId;		// 장치 ID
	private String location;			// 위치
	private Date regDate;			// 등록일시

}
