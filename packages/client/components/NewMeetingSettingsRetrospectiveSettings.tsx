import {ClassNames} from '@emotion/core'
import React from 'react'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import NewMeetingDropdown from './NewMeetingDropdown'
import NewMeetingSettingsToggleAnonymity from './NewMeetingSettingsToggleAnonymity'
import NewMeetingSettingsToggleCheckIn from './NewMeetingSettingsToggleCheckIn'

interface Props {
  settings: any // fixme
}

const NewMeetingSettingsRetrospectiveSettings = (props: Props) => {
  const {settings} = props
  const {togglePortal, menuPortal, originRef, menuProps} = useMenu<HTMLDivElement>(
    MenuPosition.LOWER_RIGHT,
    {
      parentId: 'newMeetingRoot',
      isDropdown: true
    }
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
