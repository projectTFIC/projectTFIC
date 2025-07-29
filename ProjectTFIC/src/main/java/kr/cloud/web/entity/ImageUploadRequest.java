
package kr.cloud.web.entity;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@NoArgsConstructor
@AllArgsConstructor
@Data
public class ImageUploadRequest {
	
	// [ devices 테이블 ]
	// 건설현장 카메라 및 CCTV 정보
	
    private String label; // 라벨
    private String imageData; // 이미지데이터

}
