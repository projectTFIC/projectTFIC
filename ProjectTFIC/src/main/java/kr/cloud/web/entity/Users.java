package kr.cloud.web.entity;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@NoArgsConstructor
@AllArgsConstructor
@Data
public class Users {
	
	// [ users 테이블 ]
	// 유저 정보
	
	private int idx;			// 유저 고유번호
	private String user_id;		// 유저 아이디	
	private String password;	// 유저 비밀번호
	private String name;		// 유저 이름
	private String department;	// 유저 소속
	private String email;		// 유저 이메일
	private String phone;		// 유저 핸드폰
	private Date regDate;		// 유저 등록일시

}