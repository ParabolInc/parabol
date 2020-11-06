export interface PutFileOptions {
  fileName: string
  ext: string
  buffer: Buffer
  userId: string
}

export default abstract class FileStoreManager {
  abstract async putFile(options: PutFileOptions): Promise<string>
}
