package kr.cloud.web.entity;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@NoArgsConstructor
@AllArgsConstructor
@Data
public class Report {
	
	// [ Report 테이블 ]
	// 보고서 작성 관련 정보
	
	private int report_Id;			// 레포트 아이디
	private String reportTitle;		// 레포트 제목		
	private Long typeId;		// 사건 분류
	private String reportFile;		// 사건 관련 자료
	private String userId;		// 사용자 아이디
	private String name;			// 작성자
	private Date regDate;			// 등록일시

}
