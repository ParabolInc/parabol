import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import ToggleSummaryEmailMutation from '../mutations/ToggleSummaryEmailMutation'
import {PALETTE} from '../styles/paletteV3'
import {EmailNotifications_viewer$key} from '../__generated__/EmailNotifications_viewer.graphql'
import Checkbox from './Checkbox'
import StyledError from './StyledError'

const Wrapper = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center'
})

const Text = styled('div')({
  fontWeight: 600,
  paddingRight: 8
})

const ErrorMessage = styled(StyledError)({
  paddingRight: 8
})

const StyledCheckbox = styled(Checkbox)({
  paddingRight: 8,
  color: PALETTE.SKY_500
})

type Props = {
  viewerRef: EmailNotifications_viewer$key
}

const EmailNotifications = (props: Props) => {
  const {viewerRef} = props
  const atmosphere = useAtmosphere()
  const {error, onError, onCompleted} = useMutationProps()
  const {sendSummaryEmail} = useFragment(
    graphql`
      fragment EmailNotifications_viewer on User {
        sendSummaryEmail
      }
    `,
    viewerRef
  )

  const handleClick = () => {
    ToggleSummaryEmailMutation(atmosphere, {}, {onError, onCompleted})
  }

  return (
    <Wrapper>
      <StyledCheckbox active={sendSummaryEmail} onClick={handleClick} />
      <Text>{'Send meeting summary emails'}</Text>
      <ErrorMessage>{error?.message}</ErrorMessage>
    </Wrapper>
  )
}

export default EmailNotifications
