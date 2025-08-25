import boto3

service_name = 's3'
endpoint_url = 'https://kr.object.ncloudstorage.com'
region_name = 'kr-standard'
access_key = 'ncp_iam_BPASKR5lTP9m0VvbC1at'
secret_key = 'ncp_iam_BPKSKRYFjzLktMktLnk9O4XHdcSJG7vuWE'

if __name__ == "__main__":
    s3 = boto3.client(service_name, endpoint_url=endpoint_url, aws_access_key_id=access_key,
                      aws_secret_access_key=secret_key)

    response = s3.list_buckets()
    
    for bucket in response.get('Buckets', []):
        print (bucket.get('Name'))

