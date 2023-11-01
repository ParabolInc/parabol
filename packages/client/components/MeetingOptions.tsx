import styled from '@emotion/styled'
import React from 'react'
import IconLabel from './IconLabel'
import {Menu} from '../ui/Menu/Menu'
import {MenuItem} from '../ui/Menu/MenuItem'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import {OptionsButton} from './TeamPrompt/TeamPromptOptions'

const MeetingOptions = () => {
  return (
    <Menu
      trigger={
        <OptionsButton>
          <IconLabel icon='tune' iconLarge />
          <div className='text-slate-700'>Options</div>
        </OptionsButton>
      }
    >
      <MenuItem
        value='template'
        label='Change template'
        onClick={() => {}}
        icon={<SwapHorizIcon />}
      />
    </Menu>
  )
}

export default MeetingOptions
