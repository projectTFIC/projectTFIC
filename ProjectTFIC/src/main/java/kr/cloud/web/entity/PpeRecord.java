package kr.cloud.web.entity;

import jakarta.persistence.Entity;
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
    @Column(name = "record_id")
    private int recordId; // 가능하면 Long으로 변경 추천

    @Column(name = "record_title")
    private String recordTitle;

    @Column(name = "type_id")
    private int typeId;

    @Column(name = "original_img")
    private String originalImg;

    @Column(name = "detect_img")
    private String detectImg;
}
