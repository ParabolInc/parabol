export interface CompletedHandler {
  (response: any, errors?: Array<Error>): void
}

export interface ErrorHandler {
  (error: Error): void
}
