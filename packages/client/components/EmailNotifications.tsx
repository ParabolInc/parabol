import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import ToggleSummaryEmailMutation from '../mutations/ToggleSummaryEmailMutation'
import {PALETTE} from '../styles/paletteV3'
import Checkbox from './Checkbox'
import StyledError from './StyledError'

const Wrapper = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center'
})

const Link = styled('div')({
  fontWeight: 600,
  color: PALETTE.SKY_500,
  '&:hover': {
    cursor: 'pointer'
  }
})

const Title = styled('div')({
  paddingLeft: 16,
  paddingBottom: 16,
  fontWeight: 600
})

const StyledIcon = styled('img')({
  paddingRight: 8,
  filter: `invert(56%) sepia(10%) saturate(643%) hue-rotate(205deg) brightness(89%) contrast(92%)` // make svg slate_600
})

const Text = styled('div')({
  fontWeight: 600,
  paddingRight: 8
})

const ErrorMessage = styled(StyledError)({
  fontSize: 12,
  paddingRight: 8
})

const StyledCheckbox = styled(Checkbox)({
  paddingRight: 8,
  color: PALETTE.SKY_500
})

type Props = {
  viewerRef: any // PasswordResetLink_viewer$key
}

const EmailNotifications = (props: Props) => {
  const {viewerRef} = props
  const [isClicked, setIsClicked] = useState(true)
  const atmosphere = useAtmosphere()
  const {error, onError, onCompleted, submitMutation} = useMutationProps()
  const viewer = useFragment(
    graphql`
      fragment EmailNotifications_viewer on User {
        sendSummaryEmail
      }
    `,
    viewerRef
  )
  const {sendSummaryEmail} = viewer

  const handleClick = () => {
    setIsClicked((isClicked) => !isClicked)
    ToggleSummaryEmailMutation(atmosphere, {}, {onError, onCompleted})
  }

  return (
    <Wrapper>
      <StyledCheckbox active={sendSummaryEmail} onClick={handleClick} />
      <Text>{'Send meeting summary emails'}</Text>
    </Wrapper>
  )
}

export default EmailNotifications
