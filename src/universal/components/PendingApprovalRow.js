// @flow
import type {MutationProps} from 'universal/utils/relay/withMutationProps'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import Button from 'universal/components/Button/Button'
import Row from 'universal/components/Row/Row'
import RowActions from 'universal/components/Row/RowActions'
import RowInfo from 'universal/components/Row/RowInfo'
import RowInfoCopy from 'universal/components/Row/RowInfoCopy'
import RowInfoHeader from 'universal/components/Row/RowInfoHeader'
import RowInfoHeading from 'universal/components/Row/RowInfoHeading'
import Tooltip from 'universal/components/Tooltip/Tooltip'
import UserRowActionsBlock from 'universal/components/UserRowActionsBlock'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import RejectOrgApprovalModal from 'universal/modules/notifications/components/RejectOrgApprovalModal/RejectOrgApprovalModal'
import ApproveToOrgMutation from 'universal/mutations/ApproveToOrgMutation'
import CancelApprovalMutation from 'universal/mutations/CancelApprovalMutation'
import defaultUserAvatar from 'universal/styles/theme/images/avatar-user.svg'
import appTheme from 'universal/styles/theme/theme'
import {MONTHLY_PRICE, PRO} from 'universal/utils/constants'
import fromNow from 'universal/utils/fromNow'
import withMutationProps from 'universal/utils/relay/withMutationProps'
import type {PendingApprovalRow_orgApproval as OrgApproval} from './__generated__/PendingApprovalRow_orgApproval.graphql'

type Props = {|
  atmosphere: Object,
  orgApproval: OrgApproval,
  ...MutationProps
|}

const originAnchor = {
  vertical: 'top',
  horizontal: 'center'
}

const targetAnchor = {
  vertical: 'bottom',
  horizontal: 'center'
}

const PendingApprovalRow = (props: Props) => {
  const {atmosphere, onError, onCompleted, submitMutation, orgApproval, submitting, team} = props
  const {orgApprovalId, email, createdAt, notification} = orgApproval
  const {
    organization: {orgId, orgName, isBillingLeader, billingLeaders, tier}
  } = team
  const cancel = () => {
    if (submitting) return
    submitMutation()
    CancelApprovalMutation(atmosphere, orgApprovalId, onError, onCompleted)
  }
  const tip = (
    <div>
      {billingLeaders.map(({preferredName, email}) => (
        <div key={email}>{`${preferredName} <${email}>`}</div>
      ))}
    </div>
  )
  return (
    <Row backgroundColor={appTheme.palette.yellow30l}>
      <div>
        <img alt='' src={defaultUserAvatar} />
      </div>
      <RowInfo>
        <RowInfoHeader>
          <RowInfoHeading>{email}</RowInfoHeading>
        </RowInfoHeader>
        <RowInfoCopy useHintCopy>{`Invited ${fromNow(createdAt)}`}</RowInfoCopy>
        <RowInfoCopy>
          {isBillingLeader ? (
            <React.Fragment>
              <div>{`This user will become a member of ${orgName}`}</div>
              {tier === PRO && (
                <div>{`Your monthly invoice will increase by $${MONTHLY_PRICE}.`}</div>
              )}
            </React.Fragment>
          ) : (
            <React.Fragment>
              <span>{`Pending approval by `}</span>
              <Tooltip
                delay={200}
                maxHeight={40}
                maxWidth={500}
                originAnchor={originAnchor}
                targetAnchor={targetAnchor}
                tip={tip}
              >
                <b>{'a billing leader '}</b>
              </Tooltip>
              {`for ${orgName}`}
            </React.Fragment>
          )}
        </RowInfoCopy>
      </RowInfo>
      <RowActions>
        <UserRowActionsBlock>
          {isBillingLeader ? (
            <React.Fragment>
              <Button
                buttonSize='small'
                buttonStyle='primary'
                label={'Approve'}
                onClick={() => {
                  if (submitting) return
                  submitMutation()
                  ApproveToOrgMutation(atmosphere, email, orgId, onError, onCompleted)
                }}
              />
              <RejectOrgApprovalModal
                notificationId={notification.notificationId}
                inviteeEmail={email}
                inviterName={notification.inviter.inviterName}
                toggle={
                  <Button
                    buttonSize='small'
                    buttonStyle='solid'
                    colorPalette='light'
                    label={'Decline'}
                  />
                }
              />
            </React.Fragment>
          ) : (
            <Button
              buttonSize='small'
              buttonStyle='solid'
              colorPalette='light'
              label={'Cancel Invitation'}
              onClick={cancel}
            />
          )}
        </UserRowActionsBlock>
      </RowActions>
    </Row>
  )
}

export default createFragmentContainer(
  withAtmosphere(withMutationProps(PendingApprovalRow)),
  graphql`
    fragment PendingApprovalRow_team on Team {
      organization {
        orgId: id
        isBillingLeader
        orgName: name
        billingLeaders {
          preferredName
          email
        }
        tier
      }
    }

    fragment PendingApprovalRow_orgApproval on OrgApproval {
      orgApprovalId: id
      email
      createdAt
      notification {
        notificationId: id
        inviter {
          inviterName: preferredName
        }
      }
    }
  `
)
