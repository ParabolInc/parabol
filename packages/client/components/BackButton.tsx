import styled from '@emotion/styled'
import {ArrowBack} from '@mui/icons-material'
import React from 'react'
import {Link} from 'react-router-dom'
import {PALETTE} from '~/styles/paletteV3'
import FlatButton from './FlatButton'

const IconButton = styled(FlatButton)({
  color: PALETTE.SLATE_600,
  marginRight: 16,
  padding: '3px 0',
  width: 32,
  ':hover, :focus, :active': {
    color: PALETTE.SLATE_700
  }
})

const BackIcon = styled(ArrowBack)({
  color: 'inherit'
  position: 'fixed',
  bottom: '94%'
})

interface Props {
  ariaLabel: string
  to: string
}

const BackButton = ({ariaLabel, to}: Props) => {
  return (
    <Link to={to}>
      <IconButton aria-label={ariaLabel}>
        <BackIcon />
      </IconButton>
    </Link>
  )
}

export default BackButton
