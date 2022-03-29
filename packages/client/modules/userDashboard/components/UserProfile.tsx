import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {lazy} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import DeleteAccount from '../../../components/DeleteAccount'
import EditableAvatar from '../../../components/EditableAvatar/EditableAvatar'
import FieldLabel from '../../../components/FieldLabel/FieldLabel'
import BasicInput from '../../../components/InputField/BasicInput'
import Panel from '../../../components/Panel/Panel'
import SecondaryButton from '../../../components/SecondaryButton'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useDocumentTitle from '../../../hooks/useDocumentTitle'
import useModal from '../../../hooks/useModal'
import useMutationProps from '../../../hooks/useMutationProps'
import UpdateUserProfileMutation from '../../../mutations/UpdateUserProfileMutation'
import {PALETTE} from '../../../styles/paletteV3'
import defaultUserAvatar from '../../../styles/theme/images/avatar-user.svg'
import {Breakpoint, Layout} from '../../../types/constEnums'
import withForm, {WithFormProps} from '../../../utils/relay/withForm'
import Legitity from '../../../validation/Legitity'
import NotificationErrorMessage from '../../notifications/components/NotificationErrorMessage'
import UserSettingsWrapper from './UserSettingsWrapper/UserSettingsWrapper'
import {UserProfileQuery} from '../../../__generated__/UserProfileQuery.graphql'

const SettingsBlock = styled('div')({
  width: '100%'
})

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

const PanelRow = styled('div')({
  borderTop: `1px solid ${PALETTE.SLATE_300}`,
  padding: Layout.ROW_GUTTER,
  textAlign: 'center'
})

const UserAvatarInput = lazy(
  () => import(/* webpackChunkName: 'UserAvatarInput' */ '../../../components/UserAvatarInput')
)

interface UserSettingsFormProps extends WithFormProps<'preferredName'> {
  viewer: {
    preferredName: string
    picture: string
  }
}

interface Props {
  teamId: string
  queryRef: PreloadedQuery<UserProfileQuery>
}

const query = graphql`
  query UserProfileQuery {
    viewer {
      preferredName
      picture
    }
  }
`

function UserSettings(props: UserSettingsFormProps) {
  const {fields, onChange, validateField, viewer} = props
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
          <StyledButton size='medium'>{'Update'}</StyledButton>
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

const UserSettingsForm = form(UserSettings)

const UserProfile = ({queryRef}: Props) => {
  const data = usePreloadedQuery<UserProfileQuery>(query, queryRef, {
    UNSTABLE_renderPolicy: 'full'
  })
  const {viewer} = data
  useDocumentTitle('My Profile | Parabol', 'My Profile')
  return (
    <UserSettingsWrapper>
      <SettingsBlock>
        <Panel label='My Information'>
          <UserSettingsForm viewer={viewer} />
        </Panel>
        <Panel label='Danger Zone'>
          <PanelRow>
            <DeleteAccount />
          </PanelRow>
        </Panel>
      </SettingsBlock>
    </UserSettingsWrapper>
  )
}

export default UserProfile
