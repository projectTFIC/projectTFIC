package kr.cloud.web.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "report")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class Report {
	
	// [ reports 테이블 ]
	// 현장 안전 관리 보고서 정보
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    @Column(name = "report_id")
    private int reportId;        	// 보고서 아이디
	
	@Column(name = "report_title")
    private String reportTitle;  	// 보고서 제목 
	
	@Column(name = "type_id")
    private Long typeId;         	// 보고서 유형
	
	@Column(name = "report_file")
    private String reportFile;   	// 보고서 파일
	
	@Column(name = "user_id")
    private String userId;       	// 작성자 아이디
	
	@Column(name = "name")
    private String name;         	// 작성자 이름 
	
    @Column(name = "reg_date")
    private Date regDate;        	// 등록일시
    
}
