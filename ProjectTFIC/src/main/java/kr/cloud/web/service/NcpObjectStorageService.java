package kr.cloud.web.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.ObjectMetadata;

import java.io.File;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class NcpObjectStorageService {

    private final AmazonS3 ncpS3Client;

    @Value("${ncp.s3.bucket}")
    private String bucketName;

    public String uploadPdfToObjectStorage(String localPdfPath, String targetFilename) {
        File file = new File(localPdfPath);
        
     // ✅ 업로드 전 상태 로그
        log.info("[S3] bucket={}, key=reports/{}, localPath={}, exists={}, size={}",
                 bucketName, targetFilename, localPdfPath, file.exists(), file.length());
        
        if (!file.exists()) {
            throw new RuntimeException("업로드할 파일이 존재하지 않습니다: " + localPdfPath);
        }

        String s3Key = "reports/" + targetFilename;
        try {
        	ObjectMetadata meta = new ObjectMetadata();
            meta.setContentType("application/pdf");
        	PutObjectRequest put = new PutObjectRequest(bucketName, s3Key, file)
                    .withCannedAcl(CannedAccessControlList.PublicRead);
            put.setMetadata(meta);

            ncpS3Client.putObject(put);

            String url = "https://" + bucketName + ".kr.object.ncloudstorage.com/" + s3Key;
            log.info("[S3] 업로드 성공: {}", url);
            return url;
        } catch (Exception e) {
            log.error("[S3] 업로드 실패 bucket={}, key={}", bucketName, s3Key, e);
            throw new RuntimeException("S3 업로드 실패: " + e.getMessage(), e);
        }
    }
}