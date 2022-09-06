import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {useFragment} from 'react-relay'
import {NewMeetingSettingsRetrospectiveSettings_settings$key} from '~/__generated__/NewMeetingSettingsRetrospectiveSettings_settings.graphql'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {PortalStatus} from '../hooks/usePortal'
import NewMeetingDropdown from './NewMeetingDropdown'
import NewMeetingSettingsToggleAnonymity from './NewMeetingSettingsToggleAnonymity'
import NewMeetingSettingsToggleCheckIn from './NewMeetingSettingsToggleCheckIn'

const NewMeetingSettingsToggleCheckInMenuEntry = styled(NewMeetingSettingsToggleCheckIn)({
  background: 'none',
  borderRadius: 0
})

const NewMeetingSettingsToggleAnonymityMenuEntry = styled(NewMeetingSettingsToggleAnonymity)({
  background: 'none',
  borderRadius: 0
})

interface Props {
  settingsRef: NewMeetingSettingsRetrospectiveSettings_settings$key
}

const NewMeetingSettingsRetrospectiveSettings = (props: Props) => {
  const {settingsRef} = props

  const {t} = useTranslation()

  const {togglePortal, menuPortal, originRef, menuProps, portalStatus} = useMenu<HTMLDivElement>(
    MenuPosition.LOWER_RIGHT,
    {
      parentId: 'newMeetingRoot',
      isDropdown: true
    }
  )

  const settings = useFragment(
    graphql`
      fragment NewMeetingSettingsRetrospectiveSettings_settings on TeamMeetingSettings {
        ...NewMeetingSettingsToggleCheckIn_settings
        ...NewMeetingSettingsToggleAnonymity_settings
      }
    `,
    settingsRef
  )

  return (
    <>
      <NewMeetingDropdown
        dropdownIcon={t('NewMeetingSettingsRetrospectiveSettings.KeyboardArrowDown')}
        label={t('NewMeetingSettingsRetrospectiveSettings.Settings')}
        onClick={togglePortal}
        ref={originRef}
        opened={[PortalStatus.Entering, PortalStatus.Entered].includes(portalStatus)}
      />
      {menuPortal(
        <div {...menuProps}>
          <NewMeetingSettingsToggleCheckInMenuEntry settingsRef={settings} />
          <NewMeetingSettingsToggleAnonymityMenuEntry settingsRef={settings} />
        </div>
      )}
    </>
  )
}

export default NewMeetingSettingsRetrospectiveSettings
