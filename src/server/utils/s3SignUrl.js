import aws from 'aws-sdk';
import mime from 'mime-types';

export default function s3SignUrl(operation, filename, contentType,
  acl = 'authenticated-read') {
  if (operation !== 'getObject' && operation !== 'putObject') {
    throw new Error('S3 operation must be getObject or putObject');
  }
  contentType = contentType || mime.lookup(filename) || 'application/octet-stream';
  /*
   * Initializing AWS S3 implicitly will use environment variables
   * AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
   */
  const s3 = new aws.S3();
  const s3Params = {
    Bucket: process.env.AWS_S3_BUCKET,
    ContentType: contentType,
    Expires: 60,
    Key: filename,
  };

  if (operation === 'putObject') {
    s3Params.ACL = acl;
  }

  return s3.getSignedUrl(operation, s3Params);
}

export const s3SignGetUrl = (filename, contentType, acl) =>
  s3SignUrl('getObject', filename, contentType, acl);

export const s3SignPutUrl = (filename, contentType, acl) =>
  s3SignUrl('putObject', filename, contentType, acl);
