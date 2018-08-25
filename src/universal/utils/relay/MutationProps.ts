export interface MutationProps {
  dirty: boolean,
  error: any,
  onCompleted: () => void,
  onError: () => void,
  setDirty: () => void,
  submitMutation: () => void,
  submitting: boolean
}
