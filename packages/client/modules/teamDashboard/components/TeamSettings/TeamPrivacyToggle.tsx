import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {TeamPrivacyToggle_team$key} from '~/__generated__/TeamPrivacyToggle_team.graphql'
import Toggle from '../../../../components/Toggle/Toggle'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import useRouter from '../../../../hooks/useRouter'
import ToggleTeamPrivacyMutation from '../../../../mutations/ToggleTeamPrivacyMutation'
import {PALETTE} from '../../../../styles/paletteV3'
import {TierLabel} from '../../../../types/constEnums'

const StyledRow = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  width: '100%'
})

const ToggleBlock = styled('div')({
  display: 'flex',
  alignItems: 'center',
  marginLeft: 24,
  flexShrink: 0
})

const PrivacyLabel = styled('div')({
  fontWeight: 600,
  fontSize: 14,
  color: PALETTE.SLATE_700,
  marginRight: 8
})

const TextBlock = styled('div')({
  fontSize: 14,
  color: PALETTE.SLATE_700,
  maxWidth: '80%'
})

const Description = styled('div')({
  fontSize: 14,
  color: PALETTE.SLATE_700
})

const WarningText = styled('div')({
  fontSize: 13,
  color: PALETTE.SLATE_600,
  marginTop: 8
})

const UpgradeLink = styled('a')({
  color: PALETTE.SKY_500,
  textDecoration: 'underline',
  cursor: 'pointer'
})

interface Props {
  teamRef: TeamPrivacyToggle_team$key
}

const TeamPrivacyToggle = (props: Props) => {
  const {teamRef} = props
  const team = useFragment(
    graphql`
      fragment TeamPrivacyToggle_team on Team {
        id
        isPublic
        name
        tier
        billingTier
        orgId
      }
    `,
    teamRef
  )

  const {history} = useRouter()
  const {id: teamId, isPublic, name: teamName, billingTier, orgId} = team
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitting, submitMutation} = useMutationProps()
  const isStarterTier = billingTier === 'starter'

  const toggleTeamPrivacy = () => {
    // If team is public and on starter tier, they can't make it private
    if (isPublic && isStarterTier) return

    if (submitting) return
    submitMutation()
    ToggleTeamPrivacyMutation(atmosphere, {teamId}, {onError, onCompleted})
  }

  const handleUpgradeClick = () => {
    history.push(`/me/organizations/${orgId}`)
  }

  return (
    <StyledRow>
      <TextBlock>
        <Description>
          {isPublic
            ? `${teamName} is currently public. Anyone in your organization can find and join this team.`
            : `${teamName} is currently private. Only invited members can join this team.`}
        </Description>

        {isStarterTier && (
          <WarningText>
            {isPublic ? (
              <>
                To make this team private, you need to{' '}
                <UpgradeLink onClick={handleUpgradeClick}>
                  upgrade to {TierLabel.TEAM} Plan
                </UpgradeLink>
                .
              </>
            ) : (
              <>
                <b>Note</b>: Making this team public cannot be undone on the starter plan.
              </>
            )}
          </WarningText>
        )}
      </TextBlock>
      <ToggleBlock>
        <PrivacyLabel>Public</PrivacyLabel>
        <Toggle
          active={isPublic}
          disabled={submitting || (isPublic && isStarterTier)}
          onClick={toggleTeamPrivacy}
        />
      </ToggleBlock>
    </StyledRow>
  )
}

export default TeamPrivacyToggle
