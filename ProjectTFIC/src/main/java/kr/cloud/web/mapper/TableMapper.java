package kr.cloud.web.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import java.util.List;
import kr.cloud.web.entity.AccidentListItemDto;

@Mapper
public interface TableMapper {

	// 사고감지
	@Select("""
			SELECT
			     a.record_id AS id,
			     c.content AS type,         -- 제목: acc_content.content
			     a.record_title AS title,     -- 유형: acc_record.record_title (기존 그대로)
			     t.location AS location,
			     DATE_FORMAT(t.reg_date, '%y/%m/%d') AS date
			 FROM acc_record a
			 JOIN type_info t ON a.type_id = t.type_id
			 JOIN acc_content c ON a.record_id = c.record_id
			 ORDER BY t.reg_date DESC
			""")
	List<AccidentListItemDto> selectAccidentList();

	// 안전장비 미착용
	@Select("""
			SELECT
			    p.record_id AS id,
			    c.content AS title,
			    p.record_title AS type,       -- ppe_record의 record_title 컬럼 사용
			    t.location AS location,
			    DATE_FORMAT(t.reg_date, '%y/%m/%d') AS date
			FROM ppe_record p
			JOIN type_info t ON p.type_id = t.type_id
			JOIN ppe_content c ON p.record_id = c.record_id
			ORDER BY t.reg_date DESC

									""")
	List<AccidentListItemDto> selectPpeList();

	// 입출입
	@Select("""
			    SELECT
			        h.record_id AS id,
			        h.record_title AS title,
			        t.type_record AS type,
			        t.location AS location,
			        h.access AS access,
			        DATE_FORMAT(t.reg_date, '%y/%m/%d') AS date
			    FROM he_record h
			    JOIN type_info t ON h.type_id = t.type_id
			    ORDER BY t.reg_date DESC
			""")
	List<AccidentListItemDto> selectAccessList();
}
