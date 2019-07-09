import React from 'react'
import {Link} from 'react-router-dom'
import styled from 'react-emotion'
import {meetingBottomBarHeight} from 'universal/styles/meeting'
import appTheme from 'universal/styles/theme/appTheme'
import logoMarkPrimary from 'universal/styles/theme/images/brand/mark-primary.svg'
import logoMarkWhite from 'universal/styles/theme/images/brand/mark-white.svg'

const RootBlock = styled('div')(({variant}: {variant: 'primary' | 'white'}) => ({
  alignItems: 'center',
  borderTop: variant === 'primary' ? `.0625rem solid ${appTheme.palette.mid10a}` : undefined,
  boxSizing: 'content-box',
  display: 'flex',
  height: meetingBottomBarHeight,
  justifyContent: 'center',
  userSelect: 'none',
  width: '100%'
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
        <Image alt='Parabol' src={logoSrc} />
      </Anchor>
    </RootBlock>
  )
}

export default LogoBlock
