import styled from '@emotion/styled'
import {Flag, Link as MuiLink, OpenInNew, Replay} from '@mui/icons-material'
import React from 'react'
import {PALETTE} from '../styles/paletteV3'
import Menu from './Menu'
import MenuItem from './MenuItem'
import {MenuItemLabelStyle} from './MenuItemLabel'

const LinkIcon = styled(MuiLink)({
  color: PALETTE.SLATE_600,
  marginRight: 8
})

const ReplayIcon = styled(Replay)({
  color: PALETTE.SLATE_600,
  marginRight: 8
})

const FlagIcon = styled(Flag)({
  color: PALETTE.SLATE_600,
  marginRight: 8
})

const OptionMenuItem = styled('div')({
  ...MenuItemLabelStyle,
  width: '240px'
})

const MeetingOptionsMenu = () => {
  return (
    <Menu portalStatus={portalStatus} ariaLabel={'Edit the meeting'}>
      <MenuItem
        key='link'
        label={
          <OptionMenuItem>
            <LinkIcon />
            Copy meeting permalink
          </OptionMenuItem>
        }
      />
      <MenuItem
        key='copy'
        label={
          <OptionMenuItem>
            <ReplayIcon />
            <span>{'Edit recurrence settings'}</span>
          </OptionMenuItem>
        }
      />
      <MenuItem
        key='slack'
        label={
          <OptionMenuItem>
            <SlackSVG />
            <span className='ml-2'>Configure Slack</span>
            <OpenInNew className='ml-auto text-base text-slate-600' />
          </OptionMenuItem>
        }
      />
      <MenuItem
        key='end'
        label={
          <OptionMenuItem>
            <FlagIcon />
            <span>{'End this meeting'}</span>
          </OptionMenuItem>
        }
      />
    </Menu>
  )
}

export default MeetingOptionsMenu
