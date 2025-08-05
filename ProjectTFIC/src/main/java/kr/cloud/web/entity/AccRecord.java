package kr.cloud.web.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "acc_record")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class AccRecord {

    @Id
    @Column(name = "record_id")
    private int recordId; // DB에 맞게 Long 또는 int 사용

    @Column(name = "record_title")
    private String recordTitle;

    @Column(name = "type_id")
    private int typeId;

    @Column(name = "original_img")
    private String originalImg;

    @Column(name = "detect_img")
    private String detectImg;
}
