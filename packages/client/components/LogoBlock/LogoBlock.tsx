import styled from '@emotion/styled'
import React from 'react'
import {Link} from 'react-router-dom'
import {PALETTE} from '../../styles/paletteV3'
import logoMarkPurple from '../../styles/theme/images/brand/mark-color.svg'

const RootBlock = styled('div')({
  alignItems: 'flex-end',
  borderTop: `1px solid ${PALETTE.SLATE_200}`,
  boxSizing: 'content-box',
  display: 'flex',
  padding: 8,
  justifyContent: 'center',
  userSelect: 'none'
})

const Anchor = styled(Link)({
  display: 'block'
})

const Image = styled('img')({
  display: 'block',
  width: 32
})

interface Props {
  onClick?: () => void
  className?: string
}

const LogoBlock = (props: Props) => {
  const {onClick, className} = props
  return (
    <RootBlock className={className}>
      <Anchor title='My Dashboard' to='/meetings' onClick={onClick}>
        <Image crossOrigin='' alt='Parabol' src={logoMarkPurple} />
      </Anchor>
    </RootBlock>
  )
}

export default LogoBlock
