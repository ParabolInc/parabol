import styled from '@emotion/styled'
import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import AcknowledgeButton from '../AcknowledgeButton/AcknowledgeButton'
import ClearNotificationMutation from '../../../../mutations/ClearNotificationMutation'
import ui from '../../../../styles/ui'
import Row from '../../../../components/Row/Row'
import IconAvatar from '../../../../components/IconAvatar/IconAvatar'
import RaisedButton from '../../../../components/RaisedButton'
import {PromoteToBillingLeader_notification} from '../../../../__generated__/PromoteToBillingLeader_notification.graphql'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import useRouter from '../../../../hooks/useRouter'
import NotificationErrorMessage from '../NotificationErrorMessage'
import NotificationMessage from '../NotificationMessage'
import {PALETTE} from '../../../../styles/paletteV2'

const StyledButton = styled(RaisedButton)({...ui.buttonBlockStyles})
const MessageVar = styled('div')({
  cursor: 'pointer',
  textDecoration: 'underline',
  ':hover': {
    color: PALETTE.ERROR_MAIN
  }
})
const WiderButton = styled('div')({
  marginLeft: 16,
  minWidth: 132
})

interface Props {
  notification: PromoteToBillingLeader_notification
}

const PromoteToBillingLeader = (props: Props) => {
  const {notification} = props
  const atmosphere = useAtmosphere()
  const {submitting, onError, onCompleted, submitMutation, error} = useMutationProps()
  const {history} = useRouter()
  const {id: notificationId, organization} = notification
  const {name: orgName, id: orgId} = organization

  const acknowledge = () => {
    if (submitting) return
    submitMutation()
    ClearNotificationMutation(atmosphere, notificationId, onError, onCompleted)
  }

  const goToOrg = () => {
    if (submitting) return
    submitMutation()
    ClearNotificationMutation(atmosphere, notificationId, onError, onCompleted)
    history.push(`/me/organizations/${orgId}`)
  }

  return (
    <>
      <Row>
        <IconAvatar icon='account_balance' size='small' />
        <NotificationMessage>
          {'You are now a '}
          <b>
            <i>{'Billing Leader'}</i>
          </b>
          {' for '}
          <MessageVar
            onClick={goToOrg}
          >
            {orgName}
          </MessageVar>
          {'.'}
        </NotificationMessage>
        <WiderButton>
          <StyledButton
            aria-label='Go to the Organization page'
            size={'small'}
            onClick={goToOrg}
            palette='warm'
            waiting={submitting}
          >
            {'See Organization'}
          </StyledButton>
        </WiderButton>
        <AcknowledgeButton onClick={acknowledge} waiting={submitting} />
      </Row>
      <NotificationErrorMessage error={error} />
    </>
  )
}

export default createFragmentContainer(PromoteToBillingLeader, {
  notification: graphql`
    fragment PromoteToBillingLeader_notification on NotifyPromoteToOrgLeader {
      id
      organization {
        id
        name
      }
    }
  `
})
