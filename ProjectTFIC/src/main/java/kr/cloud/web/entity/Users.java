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
@Table(name = "users")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class Users {
	
	// [ users 테이블 ]
	// 회원 프로필 정보
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY) 
	@Column(name = "idx")
	private int idx;				// 고유번호
	
	@Column(name = "user_id")
	private String userId;			// 아이디	
	
	@Column(name = "password")
	private String password;		// 비밀번호
	
	@Column(name = "name")
	private String name;			// 이름
	
	@Column(name = "department")
	private String department;		// 부서
	
	@Column(name = "email")
	private String email;			// 이메일
	
	@Column(name = "phone")
	private String phone;			// 연락처
	
	@Column(name = "reg_date")
	private Date regDate;			// 등록일시

}