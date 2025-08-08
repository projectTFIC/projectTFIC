package kr.cloud.web.controller;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;
import kr.cloud.web.dto.ChatLogDto;
import kr.cloud.web.service.ChatLogService;
import kr.cloud.web.service.ChatLogCaster;


@RestController
@RequestMapping("/chatlog")
@RequiredArgsConstructor
public class ChatLogController {

    private final ChatLogService chatLogService;
    private final ChatLogCaster chatLogCaster;

    
    // [ 대시보드 초기 로딩용 API ]
    @GetMapping("/initlist")
    public List<ChatLogDto> getRecentLogs() {
    	
        return chatLogService.getRecentChatLogs();
        
    }

    // [ 테스트용 브로드캐스트 트리거 ]
    @GetMapping("/broadcast")
    public String broadcastLogs() {
    	
        List<ChatLogDto> logs = chatLogService.getRecentChatLogs();
        chatLogCaster.broadcast(logs);
        return "Broadcast complete";
        
    }
    
}