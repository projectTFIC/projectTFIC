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

    # set bucket ACL
    # add read permission to anonymous
    s3.put_bucket_acl(Bucket=bucket_name, ACL='public-read')

    response = s3.get_bucket_acl(Bucket=bucket_name)

    # set object ACL
    # add read permission to user by ID
    object_name = '03_caputure_20250731_171000.jpg'
    owner_id = 'ncp-3013095-0'
    target_id = 'ncp-3013095-0'

    s3.put_object_acl(Bucket=bucket_name, Key=object_name,
                      AccessControlPolicy={
                          'Grants': [
                              {
                                  'Grantee': {
                                      'ID': owner_id,
                                      'Type': 'CanonicalUser'
                                  },
                                  'Permission': 'FULL_CONTROL'
                              },
                              {
                                  'Grantee': {
                                      'ID': target_id,
                                      'Type': 'CanonicalUser'
                                  },
                                  'Permission': 'FULL_CONTROL'
                              }
                          ],
                          'Owner': {
                              'ID': owner_id
                          }
                      })

    response = s3.get_object_acl(Bucket=bucket_name, Key=object_name)

