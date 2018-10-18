import React from 'react'
import PrimaryButton from 'universal/components/PrimaryButton'
import LinkButton from 'universal/components/LinkButton'
import styled from 'react-emotion'
import {typeScale} from 'universal/styles/theme/typography'

interface Props {
  closePortal: () => void
}

const buttonWidth = '16rem'

const ModalBox = styled('div')({
  alignItems: 'center',
  backgroundColor: 'white',
  borderRadius: '.5rem',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: '3rem 1.25rem',
  width: '40rem'
})

const Heading = styled('div')({
  fontSize: typeScale[8],
  margin: '0 0 1rem'
})

const Subheading = styled('div')({
  fontSize: typeScale[6],
  fontWeight: 600,
  margin: '0 0 1rem'
})

const Copy = styled('div')({
  fontSize: typeScale[4],
  margin: '0 0 2rem'
})

const StyledPrimaryButton = styled(PrimaryButton)({
  width: buttonWidth
})

const StyledLinkButton = styled(LinkButton)({
  marginTop: '1rem',
  textDecoration: 'underline',
  width: buttonWidth
})

class DemoKickoffModal extends React.Component<Props> {
  render () {
    const {closePortal} = this.props
    return (
      <ModalBox>
        <Heading>Hi there!</Heading>
        <Subheading>Welcome to the Parabol Retro Demo</Subheading>
        <Copy>Join our scripted Demo Team to try it for yourself.</Copy>
        <StyledPrimaryButton onClick={closePortal} size='large'>
          Okay, let’s start!
        </StyledPrimaryButton>
        <StyledLinkButton size='medium' palette='blue'>
          Skip the Demo — Create a Free Account
        </StyledLinkButton>
      </ModalBox>
    )
  }
}

export default DemoKickoffModal
