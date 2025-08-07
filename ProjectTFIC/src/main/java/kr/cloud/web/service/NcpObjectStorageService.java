package kr.cloud.web.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.PutObjectRequest;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import java.io.File;

@Service
@RequiredArgsConstructor
public class NcpObjectStorageService {

    private final AmazonS3 ncpS3Client;

    @Value("${ncp.s3.bucket}")
    private String bucketName;

    public String uploadPdfToObjectStorage(String localPdfPath, String targetFilename) {
        File file = new File(localPdfPath);
        String s3Key = "reports/" + targetFilename;
        
        ncpS3Client.putObject(
        	    new PutObjectRequest(bucketName, s3Key, file)
        	      .withCannedAcl(CannedAccessControlList.PublicRead)
        	);
        // NCP 오브젝트 스토리지 URL 포맷
        return "https://" + bucketName + ".kr.object.ncloudstorage.com/" + s3Key;
    }
    
   
}