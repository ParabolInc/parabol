import aws from 'aws-sdk';
import mime from 'mime-types';
import protoRelUrl from './protoRelUrl';

/*
 * Initializing AWS S3 implicitly uses environment variables
 * AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
 */
const s3 = (typeof process.env.CDN_BASE_URL !== 'undefined') && new aws.S3({
  endpoint: protoRelUrl.parse(process.env.CDN_BASE_URL).hostname,
  s3BucketEndpoint: true
});

function s3CheckInitialized() {
  if (!s3) {
    throw new Error('S3 uninitialized, did you set process.env.CDN_BASE_URL?');
  }
  return true;
}

export function s3DeleteObject(url) {
  s3CheckInitialized();
  const s3Params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: protoRelUrl.parse(url).pathname
  };
  return s3.deleteObject(s3Params).promise();
}

export function s3SignUrl(operation, filename, contentType,
  acl = 'authenticated-read') {
  s3CheckInitialized();
  if (operation !== 'getObject' && operation !== 'putObject') {
    throw new Error('S3 operation must be getObject or putObject');
  }
  contentType = contentType || mime.lookup(filename) || 'application/octet-stream';
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

/*
 * Checks to see if a url points to an asset on S3.
 *
 * Returns Boolean
 */
export function urlPossiblyOnS3(url) {
  if (!url) {
    return false;
  }
  const s3host = protoRelUrl.parse(process.env.CDN_BASE_URL).hostname;
  const urlHost = protoRelUrl.parse(url).hostname;
  return s3host === urlHost;
}
