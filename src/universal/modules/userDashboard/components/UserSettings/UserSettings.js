import PropTypes from 'prop-types'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {Field} from 'redux-form'
import RaisedButton from 'universal/components/RaisedButton'
import EditableAvatar from 'universal/components/EditableAvatar/EditableAvatar'
import FieldLabel from 'universal/components/FieldLabel/FieldLabel'
import InputField from 'universal/components/InputField/InputField'
import Panel from 'universal/components/Panel/Panel'
import Helmet from 'react-helmet'
import PhotoUploadModal from 'universal/components/PhotoUploadModal/PhotoUploadModal'
import UserAvatarInput from 'universal/modules/userDashboard/components/UserAvatarInput/UserAvatarInput'
import UserSettingsWrapper from 'universal/modules/userDashboard/components/UserSettingsWrapper/UserSettingsWrapper'
import {ACTIVITY_WELCOME} from 'universal/modules/userDashboard/ducks/settingsDuck'
import defaultUserAvatar from 'universal/styles/theme/images/avatar-user.svg'
import ui from 'universal/styles/ui'
import {randomPreferredName} from 'universal/utils/makeRandomPlaceholder'
import styled from 'react-emotion'

const SettingsBlock = styled('div')({
  width: '100%'
})

const SettingsForm = styled('form')({
  alignItems: 'center',
  borderTop: `.0625rem solid ${ui.rowBorderColor}`,
  display: 'flex',
  padding: ui.panelGutter,
  width: '100%'
})

const ActivityBlock = styled('div')({
  margin: '0 0 1.5rem'
})

const InfoBlock = styled('div')({
  flex: 1,
  paddingLeft: ui.panelGutter
})

const FieldBlock = styled('div')({
  flex: 1,
  minWidth: 0,
  paddingRight: '1rem'
})

const ControlBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'row',
  flex: 1,
  width: '100%'
})

const StyledButton = styled(RaisedButton)({
  width: '7rem'
})

const renderActivity = (activity) => {
  if (activity === ACTIVITY_WELCOME) {
    return (
      <div>
        {
          'Hey, welcome aboard! In order for your team to recognize who you are, do you mind telling us your name?'
        }
      </div>
    )
  }
  return null
}

const UserSettings = (props) => {
  const {
    activity,
    handleSubmit,
    onSubmit,
    viewer: {userId, picture}
  } = props
  const pictureOrDefault = picture || defaultUserAvatar
  const toggle = (
    <div>
      <EditableAvatar picture={pictureOrDefault} size={96} />
    </div>
  )
  const controlSize = 'medium'
  return (
    <UserSettingsWrapper>
      <Helmet title='My Settings | Parabol' />
      <SettingsBlock>
        <Panel label='My Information'>
          <SettingsForm onSubmit={handleSubmit(onSubmit)}>
            <PhotoUploadModal picture={pictureOrDefault} toggle={toggle}>
              <UserAvatarInput userId={userId} />
            </PhotoUploadModal>
            <InfoBlock>
              {activity && <ActivityBlock>{renderActivity(activity)}</ActivityBlock>}
              <FieldLabel
                customStyles={{paddingBottom: ui.fieldLabelGutter}}
                label='Name'
                fieldSize={controlSize}
                indent
                htmlFor='preferredName'
              />
              <ControlBlock>
                <FieldBlock>
                  {/* TODO: Make me Editable.js (TA) */}
                  <Field
                    autoFocus
                    component={InputField}
                    fieldSize={controlSize}
                    name='preferredName'
                    placeholder={randomPreferredName}
                    type='text'
                  />
                </FieldBlock>
                <StyledButton size={controlSize} palette='mid'>
                  {'Update'}
                </StyledButton>
              </ControlBlock>
            </InfoBlock>
          </SettingsForm>
        </Panel>
      </SettingsBlock>
    </UserSettingsWrapper>
  )
}

UserSettings.propTypes = {
  activity: PropTypes.string, // from settingsDuck
  dispatch: PropTypes.func,
  handleSubmit: PropTypes.func,
  nextPage: PropTypes.string, // from settingsDuck
  onSubmit: PropTypes.func,
  userId: PropTypes.string,
  viewer: PropTypes.object.isRequired
}

export default createFragmentContainer(
  UserSettings,
  graphql`
    fragment UserSettings_viewer on User {
      userId: id
      preferredName
      picture
    }
  `
)
