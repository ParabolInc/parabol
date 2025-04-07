import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {TeamPrivacyToggle_team$key} from '../../../../__generated__/TeamPrivacyToggle_team.graphql'
import Toggle from '../../../../components/Toggle/Toggle'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import useRouter from '../../../../hooks/useRouter'
import ToggleTeamPrivacyMutation from '../../../../mutations/ToggleTeamPrivacyMutation'
import {Tooltip} from '../../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../../ui/Tooltip/TooltipTrigger'
import SendClientSideEvent from '../../../../utils/SendClientSideEvent'
import TeamPrivacyConfirmModal from './TeamPrivacyConfirmModal'

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
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const toggleTeamPrivacy = () => {
    // If team is public and on starter tier, they can't make it private
    if (isPublic && isStarterTier) return

    if (!isPublic && isStarterTier) {
      setShowConfirmModal(true)
      return
    }

    if (submitting) return
    submitMutation()
    ToggleTeamPrivacyMutation(atmosphere, {teamId}, {onError, onCompleted})
  }

  const handleConfirmToggle = () => {
    setShowConfirmModal(false)
    if (submitting) return
    submitMutation()
    ToggleTeamPrivacyMutation(atmosphere, {teamId}, {onError, onCompleted})
  }

  const handleCancelToggle = () => {
    setShowConfirmModal(false)
  }

  const handleUpgradeClick = () => {
    history.push(`/me/organizations/${orgId}`)
    SendClientSideEvent(atmosphere, 'Upgrade CTA Clicked', {
      upgradeCTALocation: 'publicTeams',
      orgId
    })
  }

  return (
    <>
      <div className='flex w-full items-start justify-between'>
        <div className='text-sm text-slate-700'>
          <div className='text-sm text-slate-700'>
            {isPublic ? (
              <>
                <div>
                  This team is <b>Public</b>. Anybody in the organization can find and join this
                  team.
                </div>
                {isStarterTier && (
                  <div className='mt-1 text-xs font-medium text-slate-600'>
                    <a className='cursor-pointer text-sky-500' onClick={handleUpgradeClick}>
                      Upgrade
                    </a>{' '}
                    to make it private.
                  </div>
                )}
              </>
            ) : (
              <div>
                This team is <b>Private</b>. New team members may join by invite only.
              </div>
            )}
          </div>
        </div>
        <div className='ml-6 flex flex-shrink-0 items-center'>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Toggle
                  active={!isPublic}
                  disabled={submitting || (isPublic && isStarterTier)}
                  onClick={toggleTeamPrivacy}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>{isPublic ? 'Set to private' : 'Set to public'}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <TeamPrivacyConfirmModal
        isOpen={showConfirmModal}
        teamName={teamName}
        onClose={handleCancelToggle}
        onConfirm={handleConfirmToggle}
      />
    </>
  )
}

export default TeamPrivacyToggle
