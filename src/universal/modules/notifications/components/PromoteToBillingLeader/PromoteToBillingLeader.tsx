import styled, {css} from 'react-emotion'
import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import AcknowledgeButton from 'universal/modules/notifications/components/AcknowledgeButton/AcknowledgeButton'
import defaultStyles from 'universal/modules/notifications/helpers/styles'
import ClearNotificationMutation from 'universal/mutations/ClearNotificationMutation'
import ui from 'universal/styles/ui'
import Row from 'universal/components/Row/Row'
import IconAvatar from 'universal/components/IconAvatar/IconAvatar'
import RaisedButton from 'universal/components/RaisedButton'
import {PromoteToBillingLeader_notification} from '__generated__/PromoteToBillingLeader_notification.graphql'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import useRouter from '../../../../hooks/useRouter'
import NotificationErrorMessage from '../NotificationErrorMessage'

const StyledButton = styled(RaisedButton)({...ui.buttonBlockStyles})

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
        <div className={css(defaultStyles.message)}>
          {'You are now a '}
          <b>
            <i>{'Billing Leader'}</i>
          </b>
          {' for '}
          <span
            className={css(defaultStyles.messageVar, defaultStyles.notifLink)}
            onClick={goToOrg}
          >
            {orgName}
          </span>
          {'.'}
        </div>
        <div className={css(defaultStyles.widerButton)}>
          <StyledButton
            aria-label='Go to the Organization page'
            size={ui.notificationButtonSize}
            onClick={goToOrg}
            palette='warm'
            waiting={submitting}
          >
            {'See Organization'}
          </StyledButton>
        </div>
        <AcknowledgeButton onClick={acknowledge} waiting={submitting} />
      </Row>
      <NotificationErrorMessage error={error} />
    </>
  )
}

export default createFragmentContainer(
  PromoteToBillingLeader,
  graphql`
    fragment PromoteToBillingLeader_notification on NotifyPromoteToOrgLeader {
      id
      organization {
        id
        name
      }
    }
  `
)
