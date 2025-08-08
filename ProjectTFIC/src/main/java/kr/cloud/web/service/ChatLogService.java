package kr.cloud.web.service;

import java.util.List;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import kr.cloud.web.dto.ChatLogDto;
import kr.cloud.web.mapper.ChatLogMapper;


@Service
@RequiredArgsConstructor
public class ChatLogService {
	// [ 채팅 로그 서비스 ]
    // 최근 저장된 탐지 기록 10개를 가져와서 채팅 로그에 실시간으로 출력함
	private final ChatLogMapper chatLogMapper;
    
    public List<ChatLogDto> getRecentChatLogs() {
    	
        return chatLogMapper.getRecentChatLogs();
    }
    
}