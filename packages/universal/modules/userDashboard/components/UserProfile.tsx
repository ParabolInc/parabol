import React, {Component, lazy} from 'react'
import styled from '@emotion/styled'
import Helmet from 'react-helmet'
import {createFragmentContainer, graphql} from 'react-relay'
import EditableAvatar from '../../../components/EditableAvatar/EditableAvatar'
import FieldLabel from '../../../components/FieldLabel/FieldLabel'
import BasicInput from '../../../components/InputField/BasicInput'
import LoadableModal from '../../../components/LoadableModal'
import Panel from '../../../components/Panel/Panel'
import SecondaryButton from '../../../components/SecondaryButton'
import UserSettingsWrapper from './UserSettingsWrapper/UserSettingsWrapper'
import UpdateUserProfileMutation from '../../../mutations/UpdateUserProfileMutation'
import defaultUserAvatar from '../../../styles/theme/images/avatar-user.svg'
import ui from '../../../styles/ui'
import withMutationProps, {WithMutationProps} from '../../../utils/relay/withMutationProps'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../decorators/withAtmosphere/withAtmosphere'
import withForm, {WithFormProps} from '../../../utils/relay/withForm'
import Legitity from '../../../validation/Legitity'
import {UserProfile_viewer} from '../../../../__generated__/UserProfile_viewer.graphql'
import {Layout} from '../../../types/constEnums'
import {PALETTE} from '../../../styles/paletteV2'
import NotificationErrorMessage from '../../notifications/components/NotificationErrorMessage'
import {DASH_SIDEBAR} from '../../../components/Dashboard/DashSidebar'

const SettingsBlock = styled('div')({
  width: '100%'
})

const SettingsForm = styled('form')({
  alignItems: 'center',
  borderTop: `1px solid ${PALETTE.BORDER_LIGHTER}`,
  display: 'flex',
  flexDirection: 'column',
  padding: Layout.ROW_GUTTER,
  width: '100%',
  [`@media screen and (min-width: ${DASH_SIDEBAR.BREAKPOINT}px)`]: {
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
  [`@media screen and (min-width: ${DASH_SIDEBAR.BREAKPOINT}px)`]: {
    padding: '0 16px 0 0'
  }
})

const ControlBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  [`@media screen and (min-width: ${DASH_SIDEBAR.BREAKPOINT}px)`]: {
    flexDirection: 'row',
    flex: 1
  }
})

const StyledButton = styled(SecondaryButton)({
  width: 112
})

const UserAvatarInput = lazy(() =>
  import(/* webpackChunkName: 'UserAvatarInput' */ 'universal/components/UserAvatarInput')
)

interface Props extends WithAtmosphereProps, WithMutationProps, WithFormProps {
  viewer: UserProfile_viewer
}

class UserProfile extends Component<Props> {
  onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const {
      atmosphere,
      validateField,
      viewer,
      onError,
      onCompleted,
      submitMutation,
      submitting
    } = this.props
    const preferredNameRes = validateField('preferredName')
    const preferredName = preferredNameRes.value
    if (preferredNameRes.error || preferredName === viewer.preferredName || submitting) return
    submitMutation()
    UpdateUserProfileMutation(atmosphere, {preferredName}, {onError, onCompleted})
  }

  render () {
    const {fields, onChange, viewer, error} = this.props
    const {picture} = viewer
    const pictureOrDefault = picture || defaultUserAvatar
    return (
      <UserSettingsWrapper>
        <Helmet title='My Profile | Parabol' />
        <SettingsBlock>
          <Panel label='My Information'>
            <SettingsForm onSubmit={this.onSubmit}>
              <LoadableModal
                LoadableComponent={UserAvatarInput}
                queryVars={{picture: pictureOrDefault}}
                toggle={
                  <div>
                    <EditableAvatar picture={pictureOrDefault} size={96} />
                  </div>
                }
              />
              <InfoBlock>
                <FieldLabel
                  customStyles={{paddingBottom: ui.fieldLabelGutter}}
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
                <NotificationErrorMessage error={{message: error} as any} />
              </InfoBlock>
            </SettingsForm>
          </Panel>
        </SettingsBlock>
      </UserSettingsWrapper>
    )
  }
}

const form = withForm({
  preferredName: {
    getDefault: (props) => props.viewer.preferredName,
    validate: (value) =>
      new Legitity(value)
        .trim()
        .required('That’s not much of a name, is it?')
        .min(2, 'C’mon, you call that a name?')
        .max(100, 'I want your name, not your life story')
  }
})

export default createFragmentContainer(withAtmosphere(withMutationProps(form(UserProfile))), {
  viewer: graphql`
    fragment UserProfile_viewer on User {
      preferredName
      picture
    }
  `
})
