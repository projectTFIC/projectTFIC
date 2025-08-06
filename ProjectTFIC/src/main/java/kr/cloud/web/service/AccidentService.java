package kr.cloud.web.service;

import kr.cloud.web.entity.AccidentListItemDto;
import kr.cloud.web.mapper.TableMapper;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AccidentService {

    private final TableMapper tableMapper;

    public List<AccidentListItemDto> getAllAccidents() {
        return tableMapper.selectAccidentList();
    }

    public List<AccidentListItemDto> getAllPpe() {
        return tableMapper.selectPpeList();
    }

    public List<AccidentListItemDto> getAccess() {
        return tableMapper.selectAccessList();
    }
}
