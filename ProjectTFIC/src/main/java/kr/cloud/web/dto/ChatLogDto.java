package kr.cloud.web.dto;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@NoArgsConstructor
@AllArgsConstructor
@Data
public class ChatLogDto {
	
	// [ ChatLogDto 클래스 ]
	// 대시보드 페이지에서 탐지 기록이 저장될 때마다 채팅 로그에 정보를 전달하는 클래스
    private int typeId;          	// 기능 아이디
    private String typeRecord;		// 기능 제목
    private String location;		// 탐지장소
    
    @JsonFormat(pattern = "HH:mm")    // 해당 형식의 문자열을 Date로 변환
    private Date regDate;
    
    
    // 기록 제목을 통해 탐지 유형을 결정함
    public String getDetectionType() {
    	
        if (typeRecord == null) return "";
        if (typeRecord.startsWith("중장비")) return "입출입 감지";
        if (typeRecord.startsWith("안전장비")) return "미착용 감지";
        if (typeRecord.startsWith("사고")) return "사고 감지";
        
        return "기타";
        
    }
    
}
