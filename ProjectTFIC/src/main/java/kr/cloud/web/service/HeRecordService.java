package kr.cloud.web.service;

import java.text.SimpleDateFormat;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import kr.cloud.web.entity.HeRecord;
import kr.cloud.web.entity.HeRecordDto;
import kr.cloud.web.entity.HeRecordViewDto;
import kr.cloud.web.entity.TypeInfo;
import kr.cloud.web.mapper.BoardMapper;  
import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor  
public class HeRecordService {

    // ㅇ 중장비 출입 기록을 저장하는 과정에서 DB 저장하기 위해 사용하는 객체
    private final BoardMapper boardMapper;
    
    
    // [ 중장비 유형 타입 변환 ]
    // Python 에서 전달받은 문자열 타입의 장비명을 DB에 저장할 숫자 ID로 변환하기 위한 맵
    private static final Map<String, Integer> ENGLISH_TO_ID_MAP = createHeTypeNumMap();			// 영어 식별자 -> 숫자 ID
    private static final Map<Integer, String> ID_TO_KOREAN_NAME_MAP = createHeTypeKorMap();		// 숫자 ID -> 한글 식별자
    
    private static Map<String, Integer> createHeTypeNumMap() {
        Map<String, Integer> map = new HashMap<>();
        map.put("DumpTruck_1t_under", 0);     	// 화물덤프형 1톤이하
        map.put("DumpTruck_5t_under", 1);     	// 화물덤프형 5톤미만
        map.put("DumpTruck_12t_under", 2);		// 화물덤프형 12톤미만
        map.put("DumpTruck_12t_over", 3);		// 화물덤프형 12톤이상
        map.put("Excavator_Tire", 4);			// 굴착기 (타이어식)
        map.put("Excavator_Crawler", 5);		// 굴착기 (무한궤도식)
        map.put("Loader", 6);					// 로더
        map.put("Forklift", 7);					// 지게차
        map.put("ConcreteMixerTruck", 8);		// 콘크리트믹서 트럭
        map.put("Bulldozer", 9);				// 불도저 (무한궤도식)
        map.put("DrillingMachine", 10);			// 천공기
        map.put("PileDriver", 11);				// 항타 및 항발기
        map.put("CargoTruck_1t_under", 12);		// 화물카고 1톤이하
        map.put("CargoTruck_5t_under", 13);		// 화물카고 5톤미만
        map.put("CargoTruck_25t_under", 14);	// 화물카고 25톤미만
        map.put("CargoTruck_25t_over", 15);		// 화물카고 25톤이상
        
        return Collections.unmodifiableMap(map);
        
    }
    
    
    private static Map<Integer, String> createHeTypeKorMap() {
        Map<Integer, String> map = new HashMap<>();
        map.put(0, "화물덤프형 1톤 이하");
        map.put(1, "화물덤프형 5톤 미만");
        map.put(2, "화물덤프형 12톤 미만");
        map.put(3, "화물덤프형 12톤 이상");
        map.put(4, "굴착기 (타이어식)");
        map.put(5, "굴착기 (무한궤도식)");
        map.put(6, "로더");
        map.put(7, "지게차");
        map.put(8, "콘크리트믹서 트럭");
        map.put(9, "불도저 (무한궤도식)");
        map.put(10, "천공기");
        map.put(11, "항타 및 항발기");
        map.put(12, "화물카고 1톤 이하");
        map.put(13, "화물카고 5톤 미만");
        map.put(14, "화물카고 25톤 미만");
        map.put(15, "화물카고 25톤 이상");
        
        return Collections.unmodifiableMap(map);
        
    }
    
    

    // [ 중장비 출입 : 객체 탐지 정보 DB 저장 ]
    // Controller 로부터 중장비 출입 탐지정보 (DTO) 를 받아 데이터베이스에 저장하는 로직을 처리하는 메서드
    @Transactional
    public void saveHeRecord(HeRecordDto dto) {
    	
        // 1. 탐지정보에서 받은 deviceId로 탐지장소 정보 조회
        String location = boardMapper.selectLocationByDeviceId(dto.getDeviceId());
        
        if (location == null) {
        	
            // 만약 등록되지 않은 deviceId 인 경우, 에러 처리
            throw new IllegalArgumentException("Invalid device ID: " + dto.getDeviceId());
            
        }
        
        
        // 날짜/시간 포맷을 위한 설정용 객체
        SimpleDateFormat typeInfoDateFormat = new SimpleDateFormat("yyMMdd-HH:mm:ss");
        SimpleDateFormat heRecordDateFormat = new SimpleDateFormat("HH:mm:ss");
    	
        // 중장비 유형 식별자 숫자 / 한글로 변환
        Integer heTypeNum = ENGLISH_TO_ID_MAP.getOrDefault(dto.getHeType(), -1);
        String heTypeKor = ID_TO_KOREAN_NAME_MAP.getOrDefault(heTypeNum, "알 수 없는 장비");
        
        
    	// 2. 상위 테이블 (type_info) 데이터 준비 및 저장
        TypeInfo typeInfo = new TypeInfo();
        
        // type_info 테이블에 필요한 데이터 설정
        String typeInfoTitle = "중장비 출입 " + typeInfoDateFormat.format(dto.getRegDate());
        
        typeInfo.setTypeRecord(typeInfoTitle);
        typeInfo.setDeviceId(dto.getDeviceId()); 
        typeInfo.setLocation(location);
        typeInfo.setRegDate(dto.getRegDate());
        
        // 3. type_info 테이블에 삽입 후, 생성된 type_id 를 다시 받아오기
        boardMapper.insertTypeInfo(typeInfo);
        
        
        // 4. 하위 테이블 (he_record) 에 데이터 준비 및 저장
        HeRecord heRecord = new HeRecord();
        
        // 중장비 출입 기록에 필요한 데이터 설정
        String heRecordTitle = "[" + dto.getAccess() + "] " + heTypeKor + " " + heRecordDateFormat.format(dto.getRegDate());
        
        heRecord.setTypeId(typeInfo.getTypeId()); 
        heRecord.setRecordTitle(heRecordTitle); 
        heRecord.setOriginalImg(dto.getOriginalImg());
        heRecord.setDetectImg(dto.getDetectImg());
        heRecord.setHeType(heTypeNum); 
        heRecord.setHeNumber(dto.getHeNumber());
        heRecord.setAccess(dto.getAccess());
        
        // he_record 테이블에 삽입
        boardMapper.insertHeRecord(heRecord);
        
    }
    
    
    // [ 기록관리 : 중장비 출입의 전체 기록 조회하기 ]
    // 데이터베이스에서 중장비 출입 관련 기록들을 가져오기 위해 
    // 기록관리 : 중장비 출입 게시판 전체 목록을 조회하는 메서드
    public List<HeRecordViewDto> selectAllHeRecords() {
    	
        return boardMapper.selectAllHeRecords();
        
    }
    
    
    // [ 기록관리 : 중장비 출입의 특정 기록 조회하기 ]
    // 데이터베이스에서 중장비 출입 관련 특정 기록만 가져오기 위해 
    // 기록관리 : 중장비 출입 게시판의 특정 게시글 상세내용을 조회하는 메서드
    public HeRecordViewDto selectHeRecordById(int recordId) {
    	
        return boardMapper.selectHeRecordById(recordId);
    }
    //인식용 코드 
    public String getKorTypeNameById(int typeId) {
        return ID_TO_KOREAN_NAME_MAP.getOrDefault(typeId, "알 수 없음");
    }


}