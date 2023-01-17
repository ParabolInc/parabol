import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import DashModal from '../../../../components/Dashboard/DashModal'
import DialogContent from '../../../../components/DialogContent'
import DialogTitle from '../../../../components/DialogTitle'
import IconLabel from '../../../../components/IconLabel'
import PrimaryButton from '../../../../components/PrimaryButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useRouter from '../../../../hooks/useRouter'
import SendClientSegmentEventMutation from '../../../../mutations/SendClientSegmentEventMutation'
import {PALETTE} from '../../../../styles/paletteV3'
import {ExternalLinks, Threshold} from '../../../../types/constEnums'
import {UpgradeCTALocationEnum} from '../../../../__generated__/SendClientSegmentEventMutation.graphql'
import {UnpaidTeamModalQuery} from '../../../../__generated__/UnpaidTeamModalQuery.graphql'

const StyledButton = styled(PrimaryButton)({
  margin: '1.5rem auto 0'
})

const LockedAtContent = styled(DialogContent)({
  textAlign: 'left',
  p: {
    marginBottom: 16
  }
})

const ContactUsLink = styled('a')({
  color: PALETTE.SKY_500,
  textDecoration: 'underline'
})

interface Props {
  queryRef: PreloadedQuery<UnpaidTeamModalQuery>
}

const query = graphql`
  query UnpaidTeamModalQuery($teamId: ID!) {
    viewer {
      team(teamId: $teamId) {
        lockMessageHTML
        organization {
          id
          lockedAt
          name
          billingLeaders {
            id
            preferredName
            email
          }
          creditCard {
            brand
          }
          name
        }
        name
      }
    }
  }
`

const UnpaidTeamModal = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<UnpaidTeamModalQuery>(query, queryRef, {
    UNSTABLE_renderPolicy: 'full'
  })
  const {viewer} = data
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const {viewerId} = atmosphere
  const {team} = viewer
  if (!team) return null
  const {name: teamName, organization, lockMessageHTML} = team

  const {name: organizationName} = organization

  const {id: orgId, billingLeaders, name: orgName} = organization
  const [firstBillingLeader] = billingLeaders
  const billingLeaderName = firstBillingLeader?.preferredName ?? 'Unknown'
  const email = firstBillingLeader?.email ?? 'Unknown'
  const isALeader = billingLeaders.findIndex((leader) => leader.id === viewerId) !== -1

  const goToBilling = (upgradeCTALocation: UpgradeCTALocationEnum) => {
    SendClientSegmentEventMutation(atmosphere, 'Upgrade CTA Clicked', {
      upgradeCTALocation
    })
    history.push(`/me/organizations/${orgId}`)
  }

  if (organization.lockedAt) {
    return (
      <DashModal>
        <DialogTitle>{'Organization Locked'}</DialogTitle>
        <LockedAtContent>
          <p>
            Unfortunately, <strong>{organizationName}</strong> has exceeded the{' '}
            {Threshold.MAX_PERSONAL_TIER_TEAMS} teams limit on the Starter Plan for more than{' '}
            {Threshold.PERSONAL_TIER_LOCK_AFTER_DAYS} days, and your account has been locked.
          </p>
          <p>You can re-activate your teams by upgrading your account.</p>
          If you’d like to keep using Parabol on the Starter Plan, please{' '}
          <ContactUsLink href={ExternalLinks.CONTACT} target='_blank' rel='noopener noreferrer'>
            contact us
          </ContactUsLink>{' '}
          to let us know which teams you’d like to delete to fit within the two-team limit.
          {isALeader && (
            <StyledButton size='medium' onClick={() => goToBilling('organizationLockedModal')}>
              <IconLabel icon='arrow_forward' iconAfter label='Upgrade' />
            </StyledButton>
          )}
        </LockedAtContent>
      </DashModal>
    )
  }

  if (lockMessageHTML) {
    return (
      <DashModal>
        <div dangerouslySetInnerHTML={{__html: lockMessageHTML}} />
      </DashModal>
    )
  }

  const problem = `There in an unpaid invoice for ${teamName}.`
  const solution = isALeader
    ? `Head over to ${orgName} Settings to add a payment method`
    : `Try reaching out to ${billingLeaderName} at ${email}`
  return (
    <DashModal>
      <DialogTitle>{'Oh dear…'}</DialogTitle>
      <DialogContent>
        {problem}
        <br />
        {solution}
        {isALeader && (
          <StyledButton size='medium' onClick={() => goToBilling('unpaidTeamModal')}>
            <IconLabel icon='arrow_forward' iconAfter label='Take me there' />
          </StyledButton>
        )}
      </DialogContent>
    </DashModal>
  )
}

export default UnpaidTeamModal
