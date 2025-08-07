package kr.cloud.web.entity;

import java.util.Date;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "type_info")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class TypeInfo {
	
	// [ 탐지기능 정보 테이블 ]
	// 탐지기능을 활용하여 얻은 기록 정보 (기록 및 보고서 내용과 연결하기 위한 허브)
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "type_id")
	private int typeId;				// 기능 아이디
	
	@Column(name = "type_record")
	private String typeRecord;		// 기능 제목
	
	@Column(name = "device_id")
	private int deviceId;			// 장비 아이디
	
	@Column(name = "location")
	private String location;		// 탐지장소
	
	@Column(name = "reg_date")
	private Date regDate;			// 탐지일시

}
