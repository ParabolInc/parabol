import React from 'react'
import {Link} from 'react-router-dom'
import styled from '@emotion/styled'
import {PALETTE} from '../../styles/paletteV2'
import logoMarkPrimary from '../../styles/theme/images/brand/mark-primary.svg'
import logoMarkWhite from '../../styles/theme/images/brand/mark-white.svg'

const RootBlock = styled('div')<{variant: 'primary' | 'white'}>(({variant}) => ({
  alignItems: 'flex-end',
  borderTop: variant === 'primary' ? `1px solid ${PALETTE.BACKGROUND_PRIMARY_10A}` : undefined,
  boxSizing: 'content-box',
  display: 'flex',
  padding: 8,
  justifyContent: 'center',
  userSelect: 'none'
}))

const Anchor = styled(Link)({
  display: 'block'
})

const Image = styled('img')({
  display: 'block'
})

interface Props {
  variant: 'primary' | 'white'
  onClick: () => void
}

const LogoBlock = (props: Props) => {
  const {onClick, variant} = props
  const logoSrc = variant === 'primary' ? logoMarkPrimary : logoMarkWhite
  return (
    <RootBlock variant={variant}>
      <Anchor title='My Dashboard' to='/me' onClick={onClick}>
        <Image crossOrigin='' alt='Parabol' src={logoSrc} />
      </Anchor>
    </RootBlock>
  )
}

export default LogoBlock
