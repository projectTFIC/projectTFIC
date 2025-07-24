package kr.cloud.web.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import kr.cloud.web.entity.Devices;
import kr.cloud.web.entity.Users;


@Mapper
public interface BoardMapper {

	// [ 영상 장비 리스트 전체 가져오기 ]
	List<Devices> selectDevicesAll();
	
	
	@Select("SELECT idx FROM users WHERE user_id = #{user_id} AND password = #{password}")
	public Users gologin(Users login);

	
	public int goRegister(Users register);

	
}
