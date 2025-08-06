package kr.cloud.web.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "acc_content") 
@NoArgsConstructor
@AllArgsConstructor
@Data
public class AccContent {
	
	// [ acc_content 테이블 ]
	// 자세 인식 : 사고감지 결과의 세부정보를 기록하는 테이블
	
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "content_id", nullable = false)
	private int contentId;			// 정보 아이디
    
    @Column(name = "record_id", nullable = false)
	private int recordId;			// 기록 아이디
    
    @Column(name = "content", nullable = false, length = 1000)
	private String content;			// 세부 정보	

}
