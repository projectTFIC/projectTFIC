package kr.cloud.web.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

	// [ Spring Boot - React 연동 설정 ]
	// Spring Boot 프로젝트의 CORS 허용 설정
	
    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;
	
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") 									// 모든 URL 허용
//        		.allowedOrigins("http://localhost:3000")
        		.allowedOrigins(allowedOrigins.split(",")) 			// React 개발 서버 허용
//              .allowedMethods("GET", "POST", "PUT", "DELETE");
        		.allowedMethods("*")
        		.allowedHeaders("*")
                .allowCredentials(true);
    }

}

