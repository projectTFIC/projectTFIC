package kr.cloud.web.service;

import java.text.SimpleDateFormat;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import kr.cloud.web.entity.PpeContent;
import kr.cloud.web.entity.PpeRecord;
import kr.cloud.web.entity.PpeRecordDto;
import kr.cloud.web.entity.PpeRecordViewDto;
import kr.cloud.web.entity.TypeInfo;
import kr.cloud.web.mapper.BoardMapper;  
import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor  
public class PpeRecordService {

    // ㅇ 안전장비 착용여부 기록을 저장하는 과정에서 DB 저장하기 위해 사용하는 객체
    private final BoardMapper boardMapper;
    
 
    // [ 안전장비 착용여부 : 객체 탐지 정보 DB 저장 ]
    // Controller 로부터 안전장비 착용여부 탐지정보 (DTO) 를 받아 데이터베이스에 저장하는 로직을 처리하는 메서드
    @Transactional
    public void savePpeRecord(PpeRecordDto dto) {
    	
        // 1. 탐지정보에서 받은 deviceId로 탐지장소 정보 조회
        String location = boardMapper.selectLocationByDeviceId(dto.getDeviceId());
        
        if (location == null) {
        	
            // 만약 등록되지 않은 deviceId 인 경우, 에러 처리
            throw new IllegalArgumentException("Invalid device ID: " + dto.getDeviceId());
            
        }
        
    	// 2. 상위 테이블 (type_info) 데이터 저징 및 준비
        TypeInfo typeInfo = new TypeInfo();
        
        // 3. type_info 테이블에 필요한 데이터 설정
        String typeInfoTitle = "안전장비 미착용 " + new SimpleDateFormat("yyMMdd-HH:mm:ss").format(dto.getRegDate());
        
        typeInfo.setTypeRecord(typeInfoTitle);
        typeInfo.setDeviceId(dto.getDeviceId()); 
        typeInfo.setLocation(location);
        typeInfo.setRegDate(dto.getRegDate());
        
        
        // type_info 테이블에 삽입 후, 생성된 type_id 를 다시 받아오기
        boardMapper.insertTypeInfo(typeInfo);
        
        
        // 4. 중간 테이블 (ppe_record) 에 데이터 저장
        PpeRecord ppeRecord = new PpeRecord(); 
        String ppeRecordTitle = "작업자 안전장비 미착용 " + new SimpleDateFormat("HH:mm:ss").format(dto.getRegDate());
        
        ppeRecord.setTypeId(typeInfo.getTypeId()); // 3번에서 받은 type_id 설정
        ppeRecord.setRecordTitle(ppeRecordTitle);
        ppeRecord.setOriginalImg(dto.getOriginalImg());
        ppeRecord.setDetectImg(dto.getDetectImg());
        
        // ppe_Record 테이블에 삽입
        boardMapper.insertPpeRecord(ppeRecord);
        
        // 4. 하위 테이블 (ppe_content) 에 데이터 저장
        PpeContent ppeContent = new PpeContent();
        
        ppeContent.setRecordId(ppeRecord.getRecordId()); // 위에서 받은 record_id를 사용
        ppeContent.setContent(dto.getContent());
        ppeContent.setHelmetOff(dto.getHelmetOff());
        ppeContent.setHookOff(dto.getHookOff());
        ppeContent.setBeltOff(dto.getBeltOff());
        ppeContent.setShoesOff(dto.getShoesOff());
        
        
        // ppe_Content 테이블에 삽입
        boardMapper.insertPpeContent(ppeContent);
        
    }
    
    
    // [ 기록관리 : 안전장비 착용여부의 전체 기록 조회하기 ]
    // 데이터베이스에서 안전장비 착용여부 관련 기록들을 가져오기 위해 
    // 기록관리 : 안전장비 착용여부 게시판 전체 목록을 조회하는 메서드
    public List<PpeRecordViewDto> selectAllPpeRecords() {
    	
        return boardMapper.selectAllPpeRecords(); 
        
    }
    
    
    // [ 기록관리 : 안전장비 착용여부의 특정 기록 조회하기 ]
    // 데이터베이스에서 안전장비 착용여부 관련 특정 기록만 가져오기 위해 
    // 기록관리 : 안전장비 착용여부 게시판의 특정 게시글 상세내용을 조회하는 메서드
    public PpeRecordViewDto selectPpeRecordById(int recordId) {
    	
        return boardMapper.selectPpeRecordById(recordId); 
        
    }

}