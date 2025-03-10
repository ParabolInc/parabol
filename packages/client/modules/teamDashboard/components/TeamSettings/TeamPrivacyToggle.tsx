import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {TeamPrivacyToggle_team$key} from '~/__generated__/TeamPrivacyToggle_team.graphql'
import Toggle from '../../../../components/Toggle/Toggle'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import useRouter from '../../../../hooks/useRouter'
import ToggleTeamPrivacyMutation from '../../../../mutations/ToggleTeamPrivacyMutation'
import {TierLabel} from '../../../../types/constEnums'

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
        orgId
      }
    `,
    teamRef
  )

  const {history} = useRouter()
  const {id: teamId, isPublic, name: teamName, tier, orgId} = team
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitting, submitMutation} = useMutationProps()
  const isStarterTier = tier === 'starter'

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
    <div className='flex w-full items-start justify-between'>
      <div className='max-w-[80%] text-sm text-slate-700'>
        <div className='text-sm text-slate-700'>
          {isPublic
            ? `${teamName} is currently public. Anyone in your organization can find and join this team.`
            : `${teamName} is currently private. Only invited members can join this team.`}
        </div>

        {isStarterTier && (
          <div className='mt-2 text-xs text-slate-600'>
            {isPublic ? (
              <>
                To make this team private, you need to{' '}
                <a className='cursor-pointer text-sky-500 underline' onClick={handleUpgradeClick}>
                  upgrade to {TierLabel.TEAM} Plan
                </a>
                .
              </>
            ) : (
              <>
                <b>Note</b>: Making this team public cannot be undone on the starter plan.
              </>
            )}
          </div>
        )}
      </div>
      <div className='ml-6 flex flex-shrink-0 items-center'>
        <div className='mr-2 text-sm font-semibold text-slate-700'>Public</div>
        <Toggle
          active={isPublic}
          disabled={submitting || (isPublic && isStarterTier)}
          onClick={toggleTeamPrivacy}
        />
      </div>
    </div>
  )
}

export default TeamPrivacyToggle
