package kr.cloud.web.mapper;

import java.util.List;
import java.util.Map;

import org.apache.catalina.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.springframework.data.jpa.repository.JpaRepository;

import kr.cloud.web.entity.AccContent;
import kr.cloud.web.entity.AccRecord;
import kr.cloud.web.entity.AccRecordViewDto;
import kr.cloud.web.entity.Devices;
import kr.cloud.web.entity.Report;
import kr.cloud.web.entity.HeRecord;
import kr.cloud.web.entity.HeRecordViewDto;
import kr.cloud.web.entity.PpeContent;
import kr.cloud.web.entity.PpeRecord;
import kr.cloud.web.entity.PpeRecordViewDto;
import kr.cloud.web.entity.TypeInfo;
import kr.cloud.web.entity.Users;


@Mapper
public interface BoardMapper {

	// [ 영상 장비 리스트 전체 가져오기 ]
	List<Devices> selectDevicesAll();
	
	
	@Select("SELECT * FROM users WHERE user_id = #{userId} AND password = #{password}")
	public Users gologin(Users login);

	
	public int goRegister(Users register);

	public List<TypeInfo> selectAll();
	
	@Select("SELECT COUNT(*) FROM users WHERE user_id = #{userId}")
	Integer countByUserId(String userId);
	

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

	
    // [ 장비 ID로 장소 이름을 조회하기 ]
	// 기록에서 탐지장소 정보를 가져오기 위해 장비 아이디에서 조회
	@Select("SELECT location FROM devices WHERE device_id = #{deviceId}")
    public String selectLocationByDeviceId(int deviceId);

	
    // [ type_info 테이블에 데이터를 삽입하기 ]
    // 탐지 기록과 관련된 핵심 정보를 type_info 테이블에 저장한 후, 
    // 일부 정보를 다시 typeInfo 객체에 다시 담아 반환
    public void insertTypeInfo(TypeInfo typeInfo);
    
    
    // =======================================================
    // 				안전장비(PPE) 관련 메서드
    // =======================================================
    
    // [ ppe_record 테이블에 데이터를 삽입하기 ]
    public void insertPpeRecord(PpeRecord ppeRecord);
    
    
    // [ ppe_content 테이블에 데이터를 삽입하기 ]
    public void insertPpeContent(PpeContent ppeContent);
    
    
    // [ 기록 관리 : 안전장비 착용여부 게시판의 게시글 전체 가져오기 ]
    public List<PpeRecordViewDto> selectAllPpeRecords();
    
    
    // [ 기록 관리 : 안전장비 착용여부 게시판의 특정 게시글 내용 조회하기 ]
    public PpeRecordViewDto selectPpeRecordById(int recordId);
    
    
    // =======================================================
    // 				중장비(HE) 관련 메서드
    // =======================================================
    
    // [ he_record 테이블에 데이터를 삽입하기 ]
    public void insertHeRecord(HeRecord heRecord);
    
    
    // [ 기록 관리 : 중장비 출입 게시판의 게시글 전체 가져오기 ]
    public List<HeRecordViewDto> selectAllHeRecords();
    
    
    // [ 기록 관리 : 중장비 출입 게시판의 특정 게시글 내용 조회하기 ]
    public HeRecordViewDto selectHeRecordById(int recordId);

    
    // =======================================================
    // 				사고(ACC) 관련 메서드
    // =======================================================
    
    // [ acc_record 테이블에 데이터를 삽입하기 ]
    public void insertAccRecord(AccRecord accRecord);
    
    
    // [ acc_record 테이블에 데이터를 삽입하기 ]
    public void insertAccContent(AccContent accContent);
    
    
    // [ 기록 관리 : 사고 감지 게시판의 게시글 전체 가져오기 ]
    public List<AccRecordViewDto> selectAllAccRecords();
    
    
    // [ 기록 관리 : 사고 감지 게시판의 특정 게시글 내용 조회하기 ]
    public AccRecordViewDto selectAccRecordById(int recordId);

}
	



