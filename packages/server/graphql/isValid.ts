// this is useful anytime you call `loadMany` on a dataloader
const isValid = <T>(obj: T | Error | undefined | null): obj is T => {
  return obj !== null && obj !== undefined && !(obj instanceof Error)
}
export default isValid
