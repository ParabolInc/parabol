import styled from '@emotion/styled'
import {HelpOutline, Notifications, Search} from '@mui/icons-material'
import React, {forwardRef} from 'react'
import {PALETTE} from '../styles/paletteV3'
import PlainButton from './PlainButton/PlainButton'

const ButtonIcon = styled('div')({
  height: 24,
  width: 24
})

const Button = styled(PlainButton)({
  borderRadius: 100,
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  margin: '8px 4px',
  padding: 4,
  position: 'relative',
  ':focus': {
    boxShadow: `0 0 0 2px ${PALETTE.SKY_400}`
  },
  ':active': {
    boxShadow: '0 0 0 2px transparent'
  }
})

const Badge = styled('div')({
  borderRadius: 10,
  top: 15,
  position: 'absolute',
  left: 22,
  background: PALETTE.ROSE_500,
  border: `1px solid ${PALETTE.GRAPE_700}`,
  // +1 for borders
  width: 9,
  height: 9
})

interface Props {
  //FIXME 6062: change to React.ComponentType
  icon: string
  onClick?: () => void
  onMouseEnter?: () => void
  hasBadge?: boolean
  ariaLabel: string
}

const TopBarIcon = forwardRef((props: Props, ref: any) => {
  const {icon, hasBadge, onClick, onMouseEnter, ariaLabel} = props
  return (
    <Button onClick={onClick} ref={ref} onMouseEnter={onMouseEnter} aria-label={ariaLabel}>
      <ButtonIcon>
        {
          {
            search: <Search />,
            help_outline: <HelpOutline />,
            notifications: <Notifications />
          }[icon]
        }
      </ButtonIcon>
      {hasBadge && <Badge />}
    </Button>
  )
})

export default TopBarIcon
