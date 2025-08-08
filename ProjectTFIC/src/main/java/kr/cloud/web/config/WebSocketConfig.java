package kr.cloud.web.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    // [ 클라이언트 엔드포인트 설정 ]
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
    	
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS(); 						// XHR fallback 대비 (ALB/프록시 환경 안정화)
    }

    // [ 인메모리(Simple) 브로커 사용 설정 ]
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
    	
        // 구독 경로 /topic/~ 로 구독
        registry.enableSimpleBroker("/topic");

        // 서버로 보낼 때 prefix (메시지 매핑 쓰는 경우)
        registry.setApplicationDestinationPrefixes("/app");
        
    }
    
}