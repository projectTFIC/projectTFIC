package kr.cloud.web.service;
import org.springframework.stereotype.Service;

import kr.cloud.web.mapper.BoardMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor // 생성자 주입
public class UserService {

    private final BoardMapper boardMapper; // BoardMapper 주입

    /**
     * 아이디 중복 여부를 확인하는 메소드
     * @param username 확인할 아이디
     * @return 중복이면 true, 아니면 false
     */
    public boolean isUsernameDuplicated(String username) {
        // Mapper를 호출하여 아이디 개수를 가져옴
        int count = boardMapper.checkUserIdExists(username);
        
        // count가 0보다 크면 이미 존재하는 아이디이므로 true 반환
        return count > 0;
    }
}