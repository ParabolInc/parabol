import {ClassNames} from '@emotion/core'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {NewMeetingSettingsRetrospectiveSettings_settings$key} from '~/__generated__/NewMeetingSettingsRetrospectiveSettings_settings.graphql'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import NewMeetingDropdown from './NewMeetingDropdown'
import NewMeetingSettingsToggleAnonymity from './NewMeetingSettingsToggleAnonymity'
import NewMeetingSettingsToggleCheckIn from './NewMeetingSettingsToggleCheckIn'

interface Props {
  settingsRef: NewMeetingSettingsRetrospectiveSettings_settings$key
}

const NewMeetingSettingsRetrospectiveSettings = (props: Props) => {
  const {settingsRef} = props
  const {togglePortal, menuPortal, originRef, menuProps} = useMenu<HTMLDivElement>(
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
        dropdownIcon={'keyboard_arrow_down'}
        label={'Settings'}
        onClick={togglePortal}
        ref={originRef}
      />
      {menuPortal(
        <div {...menuProps}>
          <ClassNames>
            {({css}) => (
              <>
                <NewMeetingSettingsToggleCheckIn
                  settings={settings}
                  className={css({
                    borderRadius: 0,
                    background: 'none'
                  })}
                />
                <NewMeetingSettingsToggleAnonymity
                  settingsRef={settings}
                  className={css({
                    borderRadius: 0,
                    background: 'none'
                  })}
                />
              </>
            )}
          </ClassNames>
        </div>
      )}
    </>
  )
}

export default NewMeetingSettingsRetrospectiveSettings
