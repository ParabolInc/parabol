import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {PALETTE} from '../styles/paletteV3'
import {Threshold} from '../types/constEnums'
import relativeDate from '../utils/date/relativeDate'
import {LimitExceededWarning_organization$key} from '../__generated__/LimitExceededWarning_organization.graphql'

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

interface Props {
  organizationRef: LimitExceededWarning_organization$key
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
