package kr.cloud.web.controller;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import kr.cloud.web.controller.VideoWebSocketHandler;


@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    // 웹소켓 핸들러 의존성 주입
    private final VideoWebSocketHandler videoWebSocketHandler;

    public WebSocketConfig(VideoWebSocketHandler videoWebSocketHandler) {
    	
        this.videoWebSocketHandler = videoWebSocketHandler;
        
    }
    
    
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // "/stream/{deviceId}" 경로로 오는 웹소켓 연결 요청을 videoWebSocketHandler가 처리

        registry.addHandler(videoWebSocketHandler, "/stream/{deviceId}")
                .setAllowedOrigins("*");			// 모든 도메인에서의 접속을 허용
        
    }

	
	
}
