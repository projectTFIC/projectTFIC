package kr.cloud.web.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import kr.cloud.web.dto.ChatLogDto;

public interface ChatLogMapper {
	
    @Select("""
            SELECT type_id AS typeId,
                   type_record AS typeRecord,
                   location,
                   reg_date AS regDate
            FROM type_info
            ORDER BY reg_date DESC
            LIMIT 10
    """)
	public List<ChatLogDto> getRecentChatLogs();
	

}
