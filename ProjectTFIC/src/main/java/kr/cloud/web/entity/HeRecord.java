package kr.cloud.web.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "he_record")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class HeRecord {

    @Id
    @Column(name = "record_id")
    private int recordId;

    @Column(name = "record_title")
    private String recordTitle;

    @Column(name = "type_id")
    private int typeId;

    @Column(name = "original_img")
    private String originalImg;

    @Column(name = "detect_img")
    private String detectImg;

    @Column(name = "he_type")
    private int heType;

    @Column(name = "he_number")
    private String heNumber;

    @Column(name = "access")
    private String access;
}
