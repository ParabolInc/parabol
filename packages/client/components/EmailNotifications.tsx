import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {EmailNotifications_viewer$key} from '../__generated__/EmailNotifications_viewer.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import TogglePageInvitationEmailMutation from '../mutations/TogglePageInvitationEmailMutation'
import ToggleSummaryEmailMutation from '../mutations/ToggleSummaryEmailMutation'
import {PALETTE} from '../styles/paletteV3'
import {twStyled} from '../ui/twStyled'
import Checkbox from './Checkbox'
import StyledError from './StyledError'

const Wrapper = twStyled('div')('flex py-1 items-center cursor-pointer')
const Text = twStyled('div')('pr-2')
const ErrorMessage = twStyled(StyledError)('pr-2')
const StyledCheckbox = styled(Checkbox)({
  '&&': {
    width: 24,
    height: 24,
    marginRight: 8,
    color: PALETTE.SKY_500
  }
})

type Props = {
  viewerRef: EmailNotifications_viewer$key
}

const EmailNotifications = (props: Props) => {
  const {viewerRef} = props
  const atmosphere = useAtmosphere()
  const {error, onError, onCompleted} = useMutationProps()
  const {sendSummaryEmail, sendPageInvitationEmail} = useFragment(
    graphql`
      fragment EmailNotifications_viewer on User {
        sendSummaryEmail
        sendPageInvitationEmail
      }
    `,
    viewerRef
  )

  const handleSummaryClick = () => {
    ToggleSummaryEmailMutation(atmosphere, {}, {onError, onCompleted})
  }

  const handlePageInvitationClick = () => {
    TogglePageInvitationEmailMutation(atmosphere, {}, {onError, onCompleted})
  }

  return (
    <>
      <Wrapper onClick={handleSummaryClick}>
        <StyledCheckbox active={sendSummaryEmail} />
        <Text>Receive meeting summary emails</Text>
      </Wrapper>
      <Wrapper onClick={handlePageInvitationClick}>
        <StyledCheckbox active={sendPageInvitationEmail} />
        <Text>Receive emails when pages are shared with me</Text>
      </Wrapper>
      <ErrorMessage>{error?.message}</ErrorMessage>
    </>
  )
}

export default EmailNotifications
