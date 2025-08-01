package kr.cloud.web.mapper;

import java.util.List;
import java.util.Map;

import org.apache.catalina.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.springframework.data.jpa.repository.JpaRepository;

import kr.cloud.web.entity.Devices;
import kr.cloud.web.entity.Report;
import kr.cloud.web.entity.TypeInfo;
import kr.cloud.web.entity.Users;


@Mapper
public interface BoardMapper {

	// [ 영상 장비 리스트 전체 가져오기 ]
	List<Devices> selectDevicesAll();
	
	
	@Select("SELECT * FROM users WHERE user_id = #{user_id} AND password = #{password}")
	public Users gologin(Users login);

	
	public int goRegister(Users register);

	public List<TypeInfo> selectAll();
	
	@Select("SELECT COUNT(*) FROM users WHERE user_id = #{user_id}")
	Integer countByUserId(String user_id);
	
	@Select("""
	        SELECT
	          r.report_id as reportId,
	          r.report_title as reportTitle,
	          r.type_id as typeId,
	          r.report_file as reportFile,
	          r.user_id as userId,
	          u.name as name,
	          r.reg_date as regDate
	        FROM report r
	        JOIN users u ON r.user_id = u.user_id
	        ORDER BY r.reg_date DESC
	    """)
	    List<Report> getAllReports();

	    @Select("""
	        SELECT
	          r.report_id as reportId,
	          r.report_title as reportTitle,
	          r.type_id as typeId,
	          r.report_file as reportFile,
	          r.user_id as userId,
	          u.name as name,
	          r.reg_date as regDate
	        FROM report r
	        JOIN users u ON r.user_id = u.user_id
	        WHERE r.reg_date BETWEEN #{start} AND #{end}
	        ORDER BY r.reg_date DESC
	    """)
	    List<Report> getReportsByPeriod(java.sql.Date start, java.sql.Date end);

}
	



