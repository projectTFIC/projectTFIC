package kr.cloud.web.service;

import java.util.List;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import kr.cloud.web.dto.ChatLogDto;


@Component
@RequiredArgsConstructor
public class ChatLogCaster {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcast(List<ChatLogDto> logs) {
    	
        messagingTemplate.convertAndSend("/topic/chatlog", logs);
        // WebSocket 대상 전원에게 채팅 로그 데이터 전송
        
    }
    
}