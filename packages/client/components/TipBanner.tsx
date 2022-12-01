import styled from '@emotion/styled'
import {Info as InfoIcon} from '@mui/icons-material'
import React, {ReactNode} from 'react'
import {PALETTE} from '~/styles/paletteV3'

const Banner = styled('div')({
  border: `1px dashed ${PALETTE.SLATE_400}`,
  borderRadius: 4,
  display: 'flex',
  fontSize: 14,
  lineHeight: '24px',
  padding: 15, // 16 - 1 (border-widt)
  userSelect: 'none'
})

const StyledIcon = styled('div')({
  height: 24,
  width: 24,
  color: PALETTE.SLATE_600,
  marginRight: 16
})

const Inner = styled('div')({
  fontSize: 'inherit',
  lineHeight: 'inherit'
})

interface Props {
  children: ReactNode
  className?: string
  icon?: string
}

const TipBanner = (props: Props) => {
  const {children, className, icon} = props

  return (
    <Banner className={className}>
      <StyledIcon>{icon || <InfoIcon />}</StyledIcon>
      <Inner>{children}</Inner>
    </Banner>
  )
}

export default TipBanner
