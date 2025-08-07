package kr.cloud.web.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "ppe_record")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class PpeRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "record_id")
    private int recordId; 				// 기록 아이디

    @Column(name = "record_title")
    private String recordTitle;			// 기록 제목

    @Column(name = "type_id")
    private int typeId;					// 기능 아이디

    @Column(name = "original_img")
    private String originalImg;			// 원본 이미지

    @Column(name = "detect_img")
    private String detectImg;			// 감지 이미지
    
}
