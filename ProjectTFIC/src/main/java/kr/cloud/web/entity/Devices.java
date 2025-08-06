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
@Table(name = "devices")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class Devices {
	
	// [ devices 테이블 ]
	// 건설현장 카메라 및 CCTV 정보
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY) 
    @Column(name = "device_id")
	private int deviceId;			// 장비 아이디
	
	@Column(name = "device_name")
	private String deviceName;		// 장비 이름	
	
	@Column(name = "location")
	private String location;		// 장비 설치장소
	
	@Column(name = "ip_address")
	private String ipAddress;		// IP 주소
	
	@Column(name = "port_number")
	private String portNumber;		// 포트번호
	
	@Column(name = "user_id")
	private String userId;			// 등록자
	
	@Column(name = "name")
	private String name;			// 등록자 이름
	
	@Column(name = "reg_date")
	private Date regDate;			// 등록일시

}
