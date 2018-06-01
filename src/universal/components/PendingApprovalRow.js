// @flow
import type {MutationProps} from 'universal/utils/relay/withMutationProps'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer} from 'react-relay'
import Row from 'universal/components/Row/Row'
import RowActions from 'universal/components/Row/RowActions'
import RowInfo from 'universal/components/Row/RowInfo'
import RowInfoCopy from 'universal/components/Row/RowInfoCopy'
import RowInfoHeader from 'universal/components/Row/RowInfoHeader'
import RowInfoHeading from 'universal/components/Row/RowInfoHeading'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'
import Tooltip from 'universal/components/Tooltip/Tooltip'
import UserRowActionsBlock from 'universal/components/UserRowActionsBlock'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import UserRowFlatButton from 'universal/modules/teamDashboard/components/TeamSettings/UserRowFlatButton'
import CancelApprovalMutation from 'universal/mutations/CancelApprovalMutation'
import defaultUserAvatar from 'universal/styles/theme/images/avatar-user.svg'
import appTheme from 'universal/styles/theme/theme'
import ui from 'universal/styles/ui'
import fromNow from 'universal/utils/fromNow'
import withMutationProps from 'universal/utils/relay/withMutationProps'
import type {PendingApprovalRow_orgApproval as OrgApproval} from './__generated__/PendingApprovalRow_orgApproval.graphql'

type Props = {|
  atmosphere: Object,
  orgApproval: OrgApproval,
  ...MutationProps
|}

const originAnchor = {
  vertical: 'center',
  horizontal: 'right'
}

const targetAnchor = {
  vertical: 'center',
  horizontal: 'left'
}

const TooltipIcon = styled(StyledFontAwesome)({
  color: appTheme.palette.dark70a,
  fontSize: ui.iconSize,
  lineHeight: '1.25rem',
  verticalAlign: 'middle',
  marginLeft: '.25rem',
  marginTop: '-.0625rem'
})

const PendingApprovalRow = (props: Props) => {
  const {atmosphere, onError, onCompleted, submitMutation, orgApproval, submitting} = props
  const {orgApprovalId, email, createdAt} = orgApproval

  const cancel = () => {
    if (submitting) return
    submitMutation()
    CancelApprovalMutation(atmosphere, orgApprovalId, onError, onCompleted)
  }
  const tip = <div>{'Waiting for the organization billing leader to approve.'}</div>
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
      </RowInfo>
      <RowActions>
        <UserRowActionsBlock>
          <UserRowFlatButton onClick={cancel}>{'Cancel Pending Approval'}</UserRowFlatButton>
          <span>
            <Tooltip
              delay={200}
              maxHeight={40}
              maxWidth={500}
              originAnchor={originAnchor}
              targetAnchor={targetAnchor}
              tip={tip}
            >
              <TooltipIcon name='question-circle' />
            </Tooltip>
          </span>
        </UserRowActionsBlock>
      </RowActions>
    </Row>
  )
}

export default createFragmentContainer(
  withAtmosphere(withMutationProps(PendingApprovalRow)),
  graphql`
    fragment PendingApprovalRow_orgApproval on OrgApproval {
      orgApprovalId: id
      email
      createdAt
    }
  `
)
