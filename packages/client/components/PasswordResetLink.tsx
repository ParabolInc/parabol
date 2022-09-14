import styled from '@emotion/styled'
import React, {useState} from 'react'
import passwordIcon from '../../../static/images/icons/password_black_24dp.svg'
import {PALETTE} from '../styles/paletteV3'

const Wrapper = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start'
})

const Link = styled('div')({
  fontWeight: 600,
  color: PALETTE.SKY_500
})

const Text = styled('div')({
  fontWeight: 600
})

const StyledIcon = styled('img')({
  paddingRight: 8,
  filter: `invert(56%) sepia(10%) saturate(643%) hue-rotate(205deg) brightness(89%) contrast(92%)` // make svg slate_600
})

const PasswordResetLink = () => {
  const [isClicked, setIsClicked] = useState(false)

  const handleClick = () => {
    setIsClicked(true)
  }

  return (
    <Wrapper>
      <StyledIcon crossOrigin='' src={passwordIcon} alt='Password icon' />
      {isClicked ? (
        <>
          <Text>Sent! Check your email...</Text>
          <Link onClick={handleClick}>Send a password reset email</Link>
        </>
      ) : (
        <Link onClick={handleClick}>Send a password reset email</Link>
      )}
    </Wrapper>
  )
}

export default PasswordResetLink
