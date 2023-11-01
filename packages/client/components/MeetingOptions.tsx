import styled from '@emotion/styled'
import React from 'react'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import {PALETTE} from '~/styles/paletteV3'
import BaseButton from './BaseButton'
import IconLabel from './IconLabel'
import {Menu} from '../ui/Menu/Menu'
import {MenuItem} from '../ui/Menu/MenuItem'

const OptionsButton = styled(BaseButton)({
  color: PALETTE.SKY_500,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  opacity: 1,
  padding: '0px 8px',
  fontWeight: 600,
  ':hover, :focus, :active': {
    color: PALETTE.SKY_600
  }
})

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
      <MenuItem value='option3' label='Option 3' onClick={() => {}} />
    </Menu>
  )
}

export default MeetingOptions
