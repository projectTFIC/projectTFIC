package kr.cloud.web.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import kr.cloud.web.entity.LogHistoryItemDto;

@Mapper
public interface DashboardMapper {
	int countTodayAccident();

	int countLastWeekAccident();

	int countTodayEquipment();

	int countLastWeekEquipment();

	int countTodayPpe();

	int countLastWeekPpe();

	int countTodayEvent();

	int countLastWeekEvent();

	int countYesterdayAccident();

	int countYesterdayEquipment();

	int countYesterdayPpe();

	int countYesterdayEvent();

	@Select("""
						SELECT
			  'accident' AS category,
			  '사고 감지' AS label,
			  '객체 감지 시스템에서 새로운 이벤트가 감지되었습니다' AS message,
			  t.location,
			  d.device_name AS name,                      -- 카메라명
			  a.record_title AS chipValue,               -- ⬅️ 사고 감지: record_title
			  DATE_FORMAT(t.reg_date, '%p %I:%i') AS time
			FROM acc_record a
			JOIN type_info t ON a.type_id = t.type_id
			JOIN devices d   ON t.device_id = d.device_id

			UNION ALL

			SELECT
			  'safety-violation',
			  '미착용 감지',
			  '객체 감지 시스템에서 새로운 이벤트가 감지되었습니다',
			  t.location,
			  d.device_name,
			  p.record_title,                             -- ⬅️ 미착용 감지: record_title
			  DATE_FORMAT(t.reg_date, '%p %I:%i')
			FROM ppe_record p
			JOIN type_info t ON p.type_id = t.type_id
			JOIN devices d   ON t.device_id = d.device_id

			UNION ALL

			SELECT
			  'equipment-access',
			  '입출입 감지',
			  '객체 감지 시스템에서 새로운 이벤트가 감지되었습니다',
			  t.location,
			  d.device_name,
			  h.he_number,                                -- ⬅️ 입출입 감지: he_number
			  DATE_FORMAT(t.reg_date, '%p %I:%i')
			FROM he_record h
			JOIN type_info t ON h.type_id = t.type_id
			JOIN devices d   ON t.device_id = d.device_id

			ORDER BY time DESC
			LIMIT 10
						""")
	List<LogHistoryItemDto> selectLatestLogs();

}
