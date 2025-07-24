package kr.cloud.web.service;

import com.github.sarxos.webcam.Webcam;
import kr.cloud.web.entity.Devices; 
import kr.cloud.web.mapper.BoardMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.AbstractWebSocketHandler;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class VideoWebSocketHandler extends AbstractWebSocketHandler {
	
	private final BoardMapper mapper;
    private final Map<WebSocketSession, Thread> sessionThreadMap = new ConcurrentHashMap<>();

   
    public VideoWebSocketHandler(BoardMapper mapper) {
    	
        this.mapper = mapper;
        
    }
	

}
