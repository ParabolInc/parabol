import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {TeamPrivacyToggle_team$key} from '~/__generated__/TeamPrivacyToggle_team.graphql'
import Toggle from '../../../../components/Toggle/Toggle'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import ToggleTeamPrivacyMutation from '../../../../mutations/ToggleTeamPrivacyMutation'
import {PALETTE} from '../../../../styles/paletteV3'

const StyledRow = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%'
})

const ToggleBlock = styled('div')({
  display: 'flex',
  alignItems: 'center',
  marginLeft: 16
})

const PrivacyLabel = styled('div')({
  fontWeight: 600,
  fontSize: 14,
  color: PALETTE.SLATE_700,
  marginRight: 8
})

const Description = styled('div')({
  fontSize: 14,
  color: PALETTE.SLATE_700,
  maxWidth: '70%'
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
        organization {
          hasPublicTeamsFlag: featureFlag(featureName: "publicTeams")
        }
      }
    `,
    teamRef
  )

  const {id: teamId, isPublic, name: teamName, organization} = team
  const {hasPublicTeamsFlag} = organization
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitting, submitMutation} = useMutationProps()

  // This would be implemented with a real mutation
  const toggleTeamPrivacy = () => {
    if (submitting) return
    submitMutation()
    ToggleTeamPrivacyMutation(atmosphere, {teamId, isPublic: !isPublic}, {onError, onCompleted})
  }

  if (!hasPublicTeamsFlag) return null

  return (
    <StyledRow>
      <Description>
        {isPublic
          ? `${teamName} is currently public. Anyone in your organization can find and join this team.`
          : `${teamName} is currently private. Only invited members can join this team.`}
      </Description>
      <ToggleBlock>
        <PrivacyLabel>Public</PrivacyLabel>
        <Toggle active={isPublic} disabled={submitting} onClick={toggleTeamPrivacy} />
      </ToggleBlock>
    </StyledRow>
  )
}

export default TeamPrivacyToggle
