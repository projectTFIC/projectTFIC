package kr.cloud.web.mapper;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import kr.cloud.web.entity.PpeRecord;
import java.time.LocalDateTime;
import java.util.List;

public interface NoticeMapper extends JpaRepository<PpeRecord, Integer> {

	// 유형별 집계 (PPE, ACC, 중장비 출입 포함)
	@Query(value = "SELECT ti.type_record, COUNT(*) AS cnt " + "FROM ppe_record pr "
			+ "JOIN type_info ti ON pr.type_id = ti.type_id " + "WHERE ti.reg_date BETWEEN :start AND :end "
			+ "GROUP BY ti.type_record " +

			"UNION ALL " +

			"SELECT ti.type_record, COUNT(*) " + "FROM acc_record ar " + "JOIN type_info ti ON ar.type_id = ti.type_id "
			+ "WHERE ti.reg_date BETWEEN :start AND :end " + "GROUP BY ti.type_record " +

			"UNION ALL " +

			"SELECT ti.type_record, COUNT(*) " + "FROM he_record hr " + "JOIN type_info ti ON hr.type_id = ti.type_id "
			+ "WHERE ti.reg_date BETWEEN :start AND :end " + "GROUP BY ti.type_record", nativeQuery = true)
	List<Object[]> getTypeStats(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

	// 일별, 유형별 집계
	@Query(value = "SELECT DATE(ti.reg_date), ti.type_record, COUNT(*) AS cnt " + "FROM ppe_record pr "
			+ "JOIN type_info ti ON pr.type_id = ti.type_id " + "WHERE ti.reg_date BETWEEN :start AND :end "
			+ "GROUP BY DATE(ti.reg_date), ti.type_record " +

			"UNION ALL " +

			"SELECT DATE(ti.reg_date), ti.type_record, COUNT(*) " + "FROM acc_record ar "
			+ "JOIN type_info ti ON ar.type_id = ti.type_id " + "WHERE ti.reg_date BETWEEN :start AND :end "
			+ "GROUP BY DATE(ti.reg_date), ti.type_record " +

			"UNION ALL " +

			"SELECT DATE(ti.reg_date), ti.type_record, COUNT(*) " + "FROM he_record hr "
			+ "JOIN type_info ti ON hr.type_id = ti.type_id " + "WHERE ti.reg_date BETWEEN :start AND :end "
			+ "GROUP BY DATE(ti.reg_date), ti.type_record " + "ORDER BY 1 ASC", nativeQuery = true)
	List<Object[]> getDayTypeStats(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

	// 구역별, 일별, 유형별 집계
	@Query(value = "SELECT ti.location, DATE(ti.reg_date), ti.type_record, COUNT(*) AS cnt " + "FROM ppe_record pr "
			+ "JOIN type_info ti ON pr.type_id = ti.type_id " + "WHERE ti.reg_date BETWEEN :start AND :end "
			+ "GROUP BY ti.location, DATE(ti.reg_date), ti.type_record " +

			"UNION ALL " +

			"SELECT ti.location, DATE(ti.reg_date), ti.type_record, COUNT(*) " + "FROM acc_record ar "
			+ "JOIN type_info ti ON ar.type_id = ti.type_id " + "WHERE ti.reg_date BETWEEN :start AND :end "
			+ "GROUP BY ti.location, DATE(ti.reg_date), ti.type_record " +

			"UNION ALL " +

			"SELECT ti.location, DATE(ti.reg_date), ti.type_record, COUNT(*) " + "FROM he_record hr "
			+ "JOIN type_info ti ON hr.type_id = ti.type_id " + "WHERE ti.reg_date BETWEEN :start AND :end "
			+ "GROUP BY ti.location, DATE(ti.reg_date), ti.type_record", nativeQuery = true)
	List<Object[]> getAreaDayTypeStats(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

	// 날짜별 입차/출차 카운트
	@Query(value = 
			  "SELECT DATE(ti.reg_date), hr.access, COUNT(*) " +
			  "FROM he_record hr " +
			  "JOIN type_info ti ON hr.type_id = ti.type_id " +
			  "WHERE ti.reg_date BETWEEN :start AND :end " +
			  "GROUP BY DATE(ti.reg_date), hr.access " +
			  "ORDER BY 1, 2",
			  nativeQuery = true)
			List<Object[]> getHeAccessDayStats(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);


}
