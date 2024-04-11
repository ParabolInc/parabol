import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {NewMeetingSettingsRetrospectiveSettings_organization$key} from '~/__generated__/NewMeetingSettingsRetrospectiveSettings_organization.graphql'
import {NewMeetingSettingsRetrospectiveSettings_team$key} from '~/__generated__/NewMeetingSettingsRetrospectiveSettings_team.graphql'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {PortalStatus} from '../hooks/usePortal'
import NewMeetingDropdown from './NewMeetingDropdown'
import NewMeetingSettingsToggleAnonymity from './NewMeetingSettingsToggleAnonymity'
import NewMeetingSettingsToggleCheckIn from './NewMeetingSettingsToggleCheckIn'
import NewMeetingSettingsToggleTeamHealth from './NewMeetingSettingsToggleTeamHealth'
import NewMeetingSettingsToggleTranscription from './NewMeetingSettingsToggleTranscription'

const NewMeetingSettingsToggleCheckInMenuEntry = styled(NewMeetingSettingsToggleCheckIn)({
  background: 'none',
  borderRadius: 0
})

const NewMeetingSettingsToggleTeamHealthMenuEntry = styled(NewMeetingSettingsToggleTeamHealth)({
  background: 'none',
  borderRadius: 0
})

const NewMeetingSettingsToggleAnonymityMenuEntry = styled(NewMeetingSettingsToggleAnonymity)({
  background: 'none',
  borderRadius: 0
})

interface Props {
  teamRef: NewMeetingSettingsRetrospectiveSettings_team$key
  organizationRef: NewMeetingSettingsRetrospectiveSettings_organization$key
}

const NewMeetingSettingsRetrospectiveSettings = (props: Props) => {
  const {teamRef, organizationRef} = props
  const {togglePortal, menuPortal, originRef, menuProps, portalStatus} = useMenu<HTMLDivElement>(
    MenuPosition.LOWER_RIGHT,
    {
      isDropdown: true
    }
  )

  const team = useFragment(
    graphql`
      fragment NewMeetingSettingsRetrospectiveSettings_team on Team {
        ...NewMeetingSettingsToggleTeamHealth_team
        retroSettings: meetingSettings(meetingType: retrospective) {
          ...NewMeetingSettingsToggleCheckIn_settings
          ...NewMeetingSettingsToggleTeamHealth_settings
          ...NewMeetingSettingsToggleAnonymity_settings
          ...NewMeetingSettingsToggleTranscription_settings
        }
      }
    `,
    teamRef
  )
  const {retroSettings} = team

  const organization = useFragment(
    graphql`
      fragment NewMeetingSettingsRetrospectiveSettings_organization on Organization {
        featureFlags {
          zoomTranscription
        }
      }
    `,
    organizationRef
  )
  const {zoomTranscription} = organization.featureFlags

  return (
    <>
      <NewMeetingDropdown
        dropdownIcon={'keyboard_arrow_down'}
        label={'Settings'}
        onClick={togglePortal}
        ref={originRef}
        opened={[PortalStatus.Entering, PortalStatus.Entered].includes(portalStatus)}
      />
      {menuPortal(
        <div {...menuProps}>
          <NewMeetingSettingsToggleCheckInMenuEntry settingsRef={retroSettings} />
          <NewMeetingSettingsToggleTeamHealthMenuEntry settingsRef={retroSettings} teamRef={team} />
          <NewMeetingSettingsToggleAnonymityMenuEntry settingsRef={retroSettings} />
          {zoomTranscription && (
            <NewMeetingSettingsToggleTranscription settingsRef={retroSettings} />
          )}
        </div>
      )}
    </>
  )
}

export default NewMeetingSettingsRetrospectiveSettings
