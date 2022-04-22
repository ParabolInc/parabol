import styled from '@emotion/styled'
import React from 'react'
import {Link} from 'react-router-dom'
import {PALETTE} from '~/styles/paletteV3'
import FlatButton from './FlatButton'
import Icon from './Icon'

const IconButton = styled(FlatButton)({
  color: PALETTE.SLATE_600,
  marginRight: 16,
  padding: '3px 0',
  width: 32,
  ':hover, :focus, :active': {
    color: PALETTE.SLATE_700
  }
})

const BackIcon = styled(Icon)({
  color: 'inherit'
})

interface Props {
  ariaLabel: string
  to: string
}

const BackButton = ({ariaLabel, to}: Props) => {
  return (
    <Link to={to}>
      <IconButton aria-label={ariaLabel}>
        <BackIcon>arrow_back</BackIcon>
      </IconButton>
    </Link>
  )
}

export default BackButton
