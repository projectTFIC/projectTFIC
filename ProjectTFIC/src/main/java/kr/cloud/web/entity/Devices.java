package kr.cloud.web.entity;

import java.util.Date;

import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity 
@NoArgsConstructor
@AllArgsConstructor
@Data
public class Devices {
	
	// [ devices 테이블 ]
	// 건설현장 카메라 및 CCTV 정보
	
	private int deviceId;			// 장비 아이디
	private String deviceName;		// 장비 이름		
	private String location;		// 장비 설치장소
	private String ipAddress;		// IP 주소
	private String portNumber;		// 포트번호
	private String userId;			// 등록자
	private Date regDate;			// 등록일시

}
