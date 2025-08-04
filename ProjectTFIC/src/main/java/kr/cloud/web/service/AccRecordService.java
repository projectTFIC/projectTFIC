package kr.cloud.web.service;

import java.text.SimpleDateFormat;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import kr.cloud.web.entity.AccContent;
import kr.cloud.web.entity.AccRecord;
import kr.cloud.web.entity.AccRecordDto;
import kr.cloud.web.entity.AccRecordViewDto;
import kr.cloud.web.entity.PpeContent;
import kr.cloud.web.entity.PpeRecord;
import kr.cloud.web.entity.PpeRecordDto;
import kr.cloud.web.entity.PpeRecordViewDto;
import kr.cloud.web.entity.TypeInfo;
import kr.cloud.web.mapper.BoardMapper;  
import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor  
public class AccRecordService {

    // ㅇ 사고 감지 기록을 저장하는 과정에서 DB 저장하기 위해 사용하는 객체
    private final BoardMapper boardMapper;
    
 
    // [ 사고 감지 : 자세 인식 정보 DB 저장 ]
    // Controller 로부터 사고 감지 인식정보 (DTO) 를 받아 데이터베이스에 저장하는 로직을 처리하는 메서드
    @Transactional
    public void saveAccRecord(AccRecordDto dto) {
    	
        // 1. 탐지정보에서 받은 deviceId로 탐지장소 정보 조회
        String location = boardMapper.selectLocationByDeviceId(dto.getDeviceId());
        
        if (location == null) {
        	
            // 만약 등록되지 않은 deviceId 인 경우, 에러 처리
            throw new IllegalArgumentException("Invalid device ID: " + dto.getDeviceId());
            
        }
        
    	// 2. 상위 테이블 (type_info) 데이터 준비 및 저장
        TypeInfo typeInfo = new TypeInfo();
        
        // type_info 테이블에 필요한 데이터 설정
        String typeInfoTitle = "사고 감지 " + new SimpleDateFormat("yyMMdd-HH:mm:ss").format(dto.getRegDate());
        
        typeInfo.setTypeRecord(typeInfoTitle);
        typeInfo.setDeviceId(dto.getDeviceId()); 
        typeInfo.setLocation(location);
        typeInfo.setRegDate(dto.getRegDate());
        
        
        // 3. type_info 테이블에 삽입 후, 생성된 type_id 를 다시 받아오기
        boardMapper.insertTypeInfo(typeInfo);
        
        
        // 4. 중간 테이블 (ppe_record) 에 데이터 저장
        AccRecord accRecord = new AccRecord(); 
        String ppeRecordTitle = "작업자 사고 감지 " + new SimpleDateFormat("HH:mm:ss").format(dto.getRegDate());
        
        accRecord.setTypeId(typeInfo.getTypeId()); 			// 3번에서 받은 type_id 설정
        accRecord.setRecordTitle(ppeRecordTitle);
        accRecord.setOriginalImg(dto.getOriginalImg());
        accRecord.setDetectImg(dto.getDetectImg());
        
        // acc_Record 테이블에 삽입 후, 생성된 record_id 받아오기
        boardMapper.insertAccRecord(accRecord);
        
        // 4. 하위 테이블 (acc_content) 에 데이터 저장
        AccContent accContent = new AccContent();
        
        accContent.setRecordId(accRecord.getRecordId()); 	// 앞서 반환받은 record_id를 사용
        accContent.setContent(dto.getContent());

        
        // acc_Content 테이블에 삽입
        boardMapper.insertAccContent(accContent);
        
    }
    
    
    // [ 기록관리 : 사고 감지 전체 기록 조회하기 ]
    // 데이터베이스에서 사고 감지 관련 기록들을 가져오기 위해 
    // 기록관리 : 사고 감지 게시판 전체 목록을 조회하는 메서드
    public List<AccRecordViewDto> selectAllAccRecords() {
    	
    	return boardMapper.selectAllAccRecords(); 
        
    }
    
    
    // [ 기록관리 : 사고 감지 특정 기록 조회하기 ]
    // 데이터베이스에서 사고 감지 관련 특정 기록만 가져오기 위해 
    // 기록관리 : 사고 감지 게시판의 특정 게시글 상세내용을 조회하는 메서드
    public AccRecordViewDto selectAccRecordById(int recordId) {
    	
    	return boardMapper.selectAccRecordById(recordId); 
        
    }

}