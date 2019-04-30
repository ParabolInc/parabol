import React from 'react'
import styled from 'react-emotion'
import RaisedButton from 'universal/components/RaisedButton'
import GoogleSVG from 'universal/components/GoogleSVG'

const StyledButton = styled(RaisedButton)({
  backgroundColor: 'white',
  borderRadius: 20,
  height: 40,
  margin: '0 auto',
  padding: '0 16px',
  width: 240
})

const IconBlock = styled('div')({
  marginRight: 16,
  '& svg': {
    display: 'block',
    height: 18,
    width: 18
  }
})

const Label = styled('div')({
  color: 'rgba(0, 0, 0, .54)',
  fontSize: 14
})

interface Props {
  label: string
  onClick: () => void
  waiting: boolean | undefined
}

function GoogleOAuthButton (props: Props) {
  const {onClick, label, waiting} = props
  return (
    <StyledButton onClick={onClick} waiting={waiting}>
      <IconBlock>
        <GoogleSVG />
      </IconBlock>
      <Label>{label}</Label>
    </StyledButton>
  )
}

export default GoogleOAuthButton
