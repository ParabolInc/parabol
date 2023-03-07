import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {useHistory} from 'react-router'
import useAtmosphere from '~/hooks/useAtmosphere'
import SendClientSegmentEventMutation from '~/mutations/SendClientSegmentEventMutation'
import useModal from '../hooks/useModal'
import CreditCardModal from '../modules/userDashboard/components/CreditCardModal/CreditCardModal'
import {PALETTE} from '../styles/paletteV3'
import {Threshold} from '../types/constEnums'
import relativeDate from '../utils/date/relativeDate'
import {InsightsDomainNudge_domain$key} from '../__generated__/InsightsDomainNudge_domain.graphql'
import PrimaryButton from './PrimaryButton'

const NudgeBlock = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  flexDirection: 'column',
  borderTop: `1px solid ${PALETTE.SLATE_400}`,
  padding: 16,
  width: '100%'
})

const WarningMsg = styled('div')({
  background: PALETTE.GOLD_100,
  padding: '16px',
  fontSize: 16,
  borderRadius: 2,
  lineHeight: '26px',
  fontWeight: 500
})

const BoldText = styled('span')({
  fontWeight: 600
})

const OverLimitBlock = styled('div')({
  backgroundColor: PALETTE.GOLD_100,
  borderRadius: 2,
  color: PALETTE.SLATE_900,
  fontSize: 16,
  lineHeight: '24px',
  width: '100%',
  display: 'flex',
  flexWrap: 'wrap'
})

const CTA = styled(PrimaryButton)({
  lineHeight: '24px',
  padding: '8px 32px',
  width: 'fit-content'
})

const ButtonBlock = styled('div')({
  paddingTop: 16
})

interface Props {
  organizationRef: any // InsightsDomainNudge_domain$key
  domainId?: string
}

const LimitExceededWarning = (props: Props) => {
  const {organizationRef, domainId} = props
  const organization = useFragment(
    graphql`
      fragment LimitExceededWarning_organization on Organization {
        name
        scheduledLockAt
      }
    `,
    organizationRef
  )
  const {scheduledLockAt, name: orgName} = organization
  const isLocked = scheduledLockAt
    ? new Date(scheduledLockAt).getTime() <= new Date().getTime()
    : false

  return (
    <OverLimitBlock>
      <WarningMsg>
        <BoldText>{domainId ?? orgName}</BoldText>
        {` is over the limit of `}
        <BoldText>{`${Threshold.MAX_STARTER_TIER_TEAMS} free teams`}</BoldText>
        {scheduledLockAt && !isLocked && (
          <>
            {`. Your free access will end in `}
            <BoldText>{`${relativeDate(scheduledLockAt)}.`}</BoldText>
          </>
        )}
        {isLocked && `. Please upgrade to continue using Parabol.`}
      </WarningMsg>
    </OverLimitBlock>
  )
}

export default LimitExceededWarning
