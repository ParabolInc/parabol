import styled from '@emotion/styled'
import React, {lazy} from 'react'
import {useTranslation} from 'react-i18next'
import EditableAvatar from '../../../../components/EditableAvatar/EditableAvatar'
import FieldLabel from '../../../../components/FieldLabel/FieldLabel'
import BasicInput from '../../../../components/InputField/BasicInput'
import SecondaryButton from '../../../../components/SecondaryButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useModal from '../../../../hooks/useModal'
import useMutationProps from '../../../../hooks/useMutationProps'
import UpdateUserProfileMutation from '../../../../mutations/UpdateUserProfileMutation'
import {PALETTE} from '../../../../styles/paletteV3'
import defaultUserAvatar from '../../../../styles/theme/images/avatar-user.svg'
import {Breakpoint, Layout} from '../../../../types/constEnums'
import withForm, {WithFormProps} from '../../../../utils/relay/withForm'
import Legitity from '../../../../validation/Legitity'
import {UserProfileQueryResponse} from '../../../../__generated__/UserProfileQuery.graphql'
import NotificationErrorMessage from '../../../notifications/components/NotificationErrorMessage'

const SettingsForm = styled('form')({
  alignItems: 'center',
  borderTop: `1px solid ${PALETTE.SLATE_300}`,
  display: 'flex',
  flexDirection: 'column',
  padding: Layout.ROW_GUTTER,
  width: '100%',
  [`@media screen and (min-width: ${Breakpoint.SIDEBAR_LEFT}px)`]: {
    flexDirection: 'row'
  }
})

const InfoBlock = styled('div')({
  flex: 1,
  paddingLeft: Layout.ROW_GUTTER
})

const FieldBlock = styled('div')({
  flex: 1,
  minWidth: 0,
  padding: '0 0 16px',
  [`@media screen and (min-width: ${Breakpoint.SIDEBAR_LEFT}px)`]: {
    padding: '0 16px 0 0'
  }
})

const ControlBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  [`@media screen and (min-width: ${Breakpoint.SIDEBAR_LEFT}px)`]: {
    flexDirection: 'row',
    flex: 1
  }
})

const StyledButton = styled(SecondaryButton)({
  width: 112
})

const UserAvatarInput = lazy(
  () => import(/* webpackChunkName: 'UserAvatarInput' */ '../../../../components/UserAvatarInput')
)

interface UserSettingsProps extends WithFormProps<'preferredName'> {
  viewer: UserProfileQueryResponse['viewer']
}

function UserSettings(props: UserSettingsProps) {
  const {fields, onChange, validateField, viewer} = props

  //FIXME i18n: My name
  const {t} = useTranslation()

  const atmosphere = useAtmosphere()
  const {error, onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const preferredNameRes = validateField('preferredName')
    const preferredName = preferredNameRes.value
    if (preferredNameRes.error || preferredName === viewer.preferredName || submitting) return
    submitMutation()
    UpdateUserProfileMutation(atmosphere, {preferredName}, {onError, onCompleted})
  }

  const {picture} = viewer
  const pictureOrDefault = picture || defaultUserAvatar
  const {togglePortal, modalPortal} = useModal()
  return (
    <SettingsForm onSubmit={onSubmit}>
      <div onClick={togglePortal}>
        <EditableAvatar picture={pictureOrDefault} size={96} />
      </div>
      {modalPortal(<UserAvatarInput picture={pictureOrDefault} />)}
      <InfoBlock>
        <FieldLabel
          customStyles={{paddingBottom: 8}}
          label='Name'
          fieldSize='medium'
          indent
          htmlFor='preferredName'
        />
        <ControlBlock>
          <FieldBlock>
            {/* TODO: Make me Editable.js (TA) */}
            <BasicInput
              {...fields.preferredName}
              autoFocus
              onChange={onChange}
              name='preferredName'
              placeholder='My name'
            />
          </FieldBlock>
          <StyledButton size='medium'>{t('UserSettings.Update')}</StyledButton>
        </ControlBlock>
        <NotificationErrorMessage error={error} />
      </InfoBlock>
    </SettingsForm>
  )
}

const form = withForm({
  preferredName: {
    getDefault: ({viewer}) => viewer.preferredName,
    validate: (value) =>
      new Legitity(value)
        .trim()
        .required('That’s not much of a name, is it?')
        .min(2, 'C’mon, you call that a name?')
        .max(100, 'I want your name, not your life story')
  }
})

export default form(UserSettings)
