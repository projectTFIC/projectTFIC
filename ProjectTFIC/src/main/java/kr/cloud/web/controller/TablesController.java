package kr.cloud.web.controller;

import kr.cloud.web.entity.AccidentListItemDto;
import kr.cloud.web.service.AccidentService;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/tablelist")
@CrossOrigin(origins = "http://localhost:3000")
public class TablesController {
    private final AccidentService accidentService;

    @GetMapping("/accidents")
    public List<AccidentListItemDto> getAccidents() {
        return accidentService.getAllAccidents();
    }
    @GetMapping("/equipment")
    public List<AccidentListItemDto> getPpe() {
        return accidentService.getAllPpe();
    }
    @GetMapping("/access")
    public List<AccidentListItemDto> getAccess() {
        return accidentService.getAccess();
    }
}
