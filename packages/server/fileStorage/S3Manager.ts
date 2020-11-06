import FileStoreManager, {PutFileOptions} from './FileStoreManager'
import getS3PutUrl from '../utils/getS3PutUrl'
import {s3PutObject} from '../utils/s3'

export default class S3Manager extends FileStoreManager {
  static getAbsoluteFileLocation(path: string): string {
    const bucket = process.env.AWS_S3_BUCKET
    if (!bucket) throw new Error('`AWS_S3_BUCKET` env var is not configured')
    return `https://${bucket}${path}`
  }

  async putFile(options: PutFileOptions): Promise<string> {
    const {fileName, ext, buffer, userId} = options
    const partialPath = `User/${userId}/picture/${fileName}.${ext}`
    const fullPath = getS3PutUrl(partialPath)
    await s3PutObject(fullPath, buffer)
    return S3Manager.getAbsoluteFileLocation(fullPath)
  }
}
