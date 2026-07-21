import type * as React from 'react'
import {useState} from 'react'
import type {UserProfileQuery} from '../../../../__generated__/UserProfileQuery.graphql'
import EditableAvatar from '../../../../components/EditableAvatar/EditableAvatar'
import FieldLabel from '../../../../components/FieldLabel/FieldLabel'
import BasicInput from '../../../../components/InputField/BasicInput'
import SecondaryButton from '../../../../components/SecondaryButton'
import UserAvatarInput from '../../../../components/UserAvatarInput'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useForm from '../../../../hooks/useForm'
import useMutationProps from '../../../../hooks/useMutationProps'
import UpdateUserProfileMutation from '../../../../mutations/UpdateUserProfileMutation'
import defaultUserAvatar from '../../../../styles/theme/images/avatar-user.svg'
import Legitity from '../../../../validation/Legitity'
import NotificationErrorMessage from '../../../notifications/components/NotificationErrorMessage'

interface UserSettingsProps {
  viewer: UserProfileQuery['response']['viewer']
}

function UserSettings(props: UserSettingsProps) {
  const {viewer} = props
  const {fields, onChange, validateField} = useForm({
    preferredName: {
      getDefault: () => viewer.preferredName,
      validate: (value: string) =>
        new Legitity(value)
          .trim()
          .required('That’s not much of a name, is it?')
          .min(2, 'C’mon, you call that a name?')
          .max(100, 'I want your name, not your life story')
    }
  })
  const atmosphere = useAtmosphere()
  const {error, onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const preferredNameRes = validateField('preferredName')
    const preferredName = preferredNameRes.value
    if (preferredNameRes.error || preferredName === viewer.preferredName || submitting) return
    submitMutation()
    UpdateUserProfileMutation(atmosphere, {updatedUser: {preferredName}}, {onError, onCompleted})
  }

  const {picture} = viewer
  const pictureOrDefault = picture || defaultUserAvatar
  const [isAvatarOpen, setIsAvatarOpen] = useState(false)
  const {value, error: fieldError} = fields.preferredName
  return (
    <form
      className='flex w-full flex-col items-center border-hairline border-t p-4 lg:flex-row'
      onSubmit={onSubmit}
    >
      <div onClick={() => setIsAvatarOpen(true)}>
        <EditableAvatar picture={pictureOrDefault} className='h-24 w-24' />
      </div>
      <UserAvatarInput
        isOpen={isAvatarOpen}
        onClose={() => setIsAvatarOpen(false)}
        picture={pictureOrDefault}
      />
      <div className='flex-1 pl-4'>
        <FieldLabel
          customStyles={{paddingBottom: 8}}
          label='Name'
          fieldSize='medium'
          indent
          htmlFor='preferredName'
        />
        <div className='flex w-full flex-col items-center lg:flex-1 lg:flex-row'>
          <div className='min-w-0 flex-1 pb-4 lg:pr-4 lg:pb-0'>
            {/* TODO: Make me Editable.js (TA) */}
            <BasicInput
              value={value}
              error={fieldError}
              autoFocus
              onChange={onChange}
              name='preferredName'
              placeholder='My name'
            />
          </div>
          <SecondaryButton size='medium' className='w-28'>
            {'Update'}
          </SecondaryButton>
        </div>
        <NotificationErrorMessage error={error} />
      </div>
    </form>
  )
}

export default UserSettings
