import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import RenameMeetingMutation from '~/mutations/RenameMeetingMutation'
import Legitity from '~/validation/Legitity'

type ValidationSettings = {
  required: {
    errorText: string
  }
  minLength: {
    min: number
    errorText: string
  }
  maxLength: {
    max: number
    errorText: string
  }
}

const defaultValidationErrors: ValidationSettings = {
  required: {
    errorText: 'Meetings need names'
  },
  minLength: {
    min: 2,
    errorText: 'Meetings need good names'
  },
  maxLength: {
    max: 50,
    errorText: 'Meetings need short names'
  }
}

export const useRenameMeeting = (
  meetingId: string,
  validationSettings: ValidationSettings = defaultValidationErrors
) => {
  const atmosphere = useAtmosphere()
  const {error, submitMutation, submitting, onCompleted, onError} = useMutationProps()

  const handleSubmit = (name: string) => {
    if (submitting || error) return
    submitMutation()
    RenameMeetingMutation(atmosphere, {meetingId, name}, {onCompleted, onError})
  }

  const validate = (rawMeetingName: string) => {
    const res = new Legitity(rawMeetingName)
      .required(validationSettings.required.errorText)
      .min(validationSettings.minLength.min, validationSettings.minLength.errorText)
      .max(validationSettings.maxLength.max, validationSettings.maxLength.errorText)
      .trim()

    if (res.error) {
      onError(new Error(res.error))
    } else if (error) {
      onCompleted()
    }
    return res
  }

  return {handleSubmit, validate, error, submitting} as const
}
