package kr.cloud.web.config;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;

import jakarta.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class NcpS3Config {

    @Value("${ncp.s3.access-key}")
    private String accessKey;

    @Value("${ncp.s3.secret-key}")
    private String secretKey;

    @Value("${ncp.s3.region}")
    private String region;

    @Value("${ncp.s3.endpoint}")
    private String endpoint;
    
    @PostConstruct
    public void printS3Config() {
        System.out.println("S3 엔드포인트: " + endpoint);
        System.out.println("S3 리전: " + region);
        System.out.println("S3 AccessKey: " + accessKey);
        // 시크릿키는 노출 주의! (테스트용만)
    }

    @Bean
    public AmazonS3 ncpS3Client() {
        BasicAWSCredentials creds = new BasicAWSCredentials(accessKey, secretKey);
        return AmazonS3ClientBuilder.standard()
                .withCredentials(new AWSStaticCredentialsProvider(creds))
                .withEndpointConfiguration(
                        new AmazonS3ClientBuilder.EndpointConfiguration(endpoint, region))
                .build();
    }
}
