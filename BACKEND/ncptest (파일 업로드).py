import boto3

service_name = 's3'
endpoint_url = 'https://kr.object.ncloudstorage.com'
region_name = 'kr-standard'
access_key = 'ncp_iam_BPASKR5sVNmUgjWifJcD'
secret_key = 'ncp_iam_BPKSKR5HbjmxW3Q7lK8D23L15PuP6C32FR'


if __name__ == "__main__":
    s3 = boto3.client(service_name, endpoint_url=endpoint_url, aws_access_key_id=access_key,
                      aws_secret_access_key=secret_key)

    bucket_name = 'aivis-obj-storage'

    # 버킷 내 폴더 생성
    object_name = 'test/'

    s3.put_object(Bucket=bucket_name, Key=object_name)

    # [ 파일 업로드 ]
    try:
        # 업로드하는 파일 경로 입력
        local_file_path = r'C:\Users\smhrd\Desktop\TFICProject\home\aivis\ai-api\test\result\모니터링페이지.png'

        # 버킷에 저장하는 파일 경로 입력
        object_name = 'test/test.png'
        
        # ACL 설정을 ExtraArgs에 추가하여 업로드
        s3.upload_file(
            local_file_path,
            bucket_name,
            object_name,
            ExtraArgs={'ACL': 'public-read'}  # 파일 공개 설정
        )
        print(f"✅ 파일 업로드 성공: {object_name}")

    except Exception as e:
        print(f"❌ 작업 실패: {e}")

