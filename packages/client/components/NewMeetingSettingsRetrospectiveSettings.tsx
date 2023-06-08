import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {NewMeetingSettingsRetrospectiveSettings_settings$key} from '~/__generated__/NewMeetingSettingsRetrospectiveSettings_settings.graphql'
import {NewMeetingSettingsRetrospectiveSettings_organization$key} from '~/__generated__/NewMeetingSettingsRetrospectiveSettings_organization.graphql'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {PortalStatus} from '../hooks/usePortal'
import NewMeetingDropdown from './NewMeetingDropdown'
import NewMeetingSettingsToggleAnonymity from './NewMeetingSettingsToggleAnonymity'
import NewMeetingSettingsToggleCheckIn from './NewMeetingSettingsToggleCheckIn'
import NewMeetingSettingsToggleTranscription from './NewMeetingSettingsToggleTranscription'
import NewMeetingSettingsToggleTeamHealth from './NewMeetingSettingsToggleTeamHealth'

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
  settingsRef: NewMeetingSettingsRetrospectiveSettings_settings$key
  organizationRef: NewMeetingSettingsRetrospectiveSettings_organization$key
}

const NewMeetingSettingsRetrospectiveSettings = (props: Props) => {
  const {settingsRef, organizationRef} = props
  const {togglePortal, menuPortal, originRef, menuProps, portalStatus} = useMenu<HTMLDivElement>(
    MenuPosition.LOWER_RIGHT,
    {
      isDropdown: true
    }
  )

  const settings = useFragment(
    graphql`
      fragment NewMeetingSettingsRetrospectiveSettings_settings on TeamMeetingSettings {
        ...NewMeetingSettingsToggleCheckIn_settings
        ...NewMeetingSettingsToggleTeamHealth_settings
        ...NewMeetingSettingsToggleAnonymity_settings
        ...NewMeetingSettingsToggleTranscription_settings
      }
    `,
    settingsRef
  )

  const organization = useFragment(
    graphql`
      fragment NewMeetingSettingsRetrospectiveSettings_organization on Organization {
        featureFlags {
          zoomTranscription
          teamHealth
        }
      }
    `,
    organizationRef
  )
  const {zoomTranscription, teamHealth} = organization.featureFlags

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
          <NewMeetingSettingsToggleCheckInMenuEntry settingsRef={settings} />
          {teamHealth && <NewMeetingSettingsToggleTeamHealthMenuEntry settingsRef={settings} />}
          <NewMeetingSettingsToggleAnonymityMenuEntry settingsRef={settings} />
          {zoomTranscription && <NewMeetingSettingsToggleTranscription settingsRef={settings} />}
        </div>
      )}
    </>
  )
}

export default NewMeetingSettingsRetrospectiveSettings
