import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import DashModal from '../../../../components/Dashboard/DashModal'
import DialogContent from '../../../../components/DialogContent'
import DialogTitle from '../../../../components/DialogTitle'
import IconLabel from '../../../../components/IconLabel'
import PrimaryButton from '../../../../components/PrimaryButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useRouter from '../../../../hooks/useRouter'
import {usePreloadedQuery, PreloadedQuery} from 'react-relay'
import {UnpaidTeamModalQuery} from '../../../../__generated__/UnpaidTeamModalQuery.graphql'

const StyledButton = styled(PrimaryButton)({
  margin: '1.5rem auto 0'
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
  if (lockMessageHTML) {
    return (
      <DashModal>
        <div dangerouslySetInnerHTML={{__html: lockMessageHTML}} />
      </DashModal>
    )
  }

  const {id: orgId, billingLeaders, name: orgName} = organization
  const [firstBillingLeader] = billingLeaders
  const billingLeaderName = firstBillingLeader?.preferredName ?? 'Unknown'
  const email = firstBillingLeader?.email ?? 'Unknown'
  const isALeader = billingLeaders.findIndex((leader) => leader.id === viewerId) !== -1
  const handleClick = () => history.push(`/me/organizations/${orgId}`)
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
          <StyledButton size='medium' onClick={handleClick}>
            <IconLabel icon='arrow_forward' iconAfter label='Take me there' />
          </StyledButton>
        )}
      </DialogContent>
    </DashModal>
  )
}

export default UnpaidTeamModal
