export interface Socket {
  prefix: string

  sendEncodedMessage(message: string, connectionId?: string): void
  keepAlive(): void
  done(): boolean
  closeTransport(code?: number, reason?: string): void
}


