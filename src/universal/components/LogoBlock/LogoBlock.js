import PropTypes from 'prop-types'
import React from 'react'
import {Link} from 'react-router-dom'
import styled from 'react-emotion'
import {meetingBottomBarHeight} from 'universal/styles/meeting'
import appTheme from 'universal/styles/theme/appTheme'
import logoMarkPrimary from 'universal/styles/theme/images/brand/mark-primary.svg'
import logoMarkWhite from 'universal/styles/theme/images/brand/mark-white.svg'

const RootBlock = styled('div')(({variant}) => ({
  alignItems: 'center',
  borderTop: variant === 'primary' && `.0625rem solid ${appTheme.palette.mid10a}`,
  boxSizing: 'content-box',
  display: 'flex',
  height: meetingBottomBarHeight,
  justifyContent: 'center',
  width: '100%'
}))

const Anchor = styled(Link)({
  display: 'block'
})

const Image = styled('img')({
  display: 'block'
})

const LogoBlock = (props) => {
  const {variant} = props
  const logoSrc = variant === 'primary' ? logoMarkPrimary : logoMarkWhite
  return (
    <RootBlock variant={variant}>
      <Anchor title='My Dashboard' to='/me/'>
        <Image alt='Parabol' src={logoSrc} />
      </Anchor>
    </RootBlock>
  )
}

LogoBlock.propTypes = {
  variant: PropTypes.oneOf(['primary', 'white'])
}

export default LogoBlock
