package kr.cloud.web.entity;

import jakarta.persistence.*;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity // 이 어노테이션 반드시 추가
@Table(name = "report") // DB 테이블명과 다르면 명시할 것, 아니면 생략 가능

@NoArgsConstructor
@AllArgsConstructor
@Data
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto_increment일 경우
    @Column(name = "report_id") // DB 컬럼명과 다르면 명시할 것
    private int reportId;

    @Column(name = "report_title")
    private String reportTitle;

    @Column(name = "type_id")
    private Long typeId;

    @Column(name = "report_file")
    private String reportFile;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "name")
    private String name;

    @Column(name = "reg_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date regDate;
}
