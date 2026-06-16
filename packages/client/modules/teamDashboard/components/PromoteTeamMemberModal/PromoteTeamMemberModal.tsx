import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import type {PromoteTeamMemberModal_teamMember$key} from '../../../../__generated__/PromoteTeamMemberModal_teamMember.graphql'
import IconLabel from '../../../../components/IconLabel'
import PrimaryButton from '../../../../components/PrimaryButton'
import useMutationProps from '../../../../hooks/useMutationProps'
import PromoteToTeamLeadMutation from '../../../../mutations/PromoteToTeamLeadMutation'
import {Dialog} from '../../../../ui/Dialog/Dialog'
import {DialogContent} from '../../../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../../../ui/Dialog/DialogTitle'
import {upperFirst} from '../../../../utils/upperFirst'

interface Props {
  isOpen: boolean
  closePortal: () => void
  teamMember: PromoteTeamMemberModal_teamMember$key
}

const PromoteTeamMemberModal = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {submitMutation, submitting, onError, onCompleted} = useMutationProps()
  const {isOpen, closePortal, teamMember: teamMemberRef} = props
  const teamMember = useFragment(
    graphql`
      fragment PromoteTeamMemberModal_teamMember on TeamMember {
        teamId
        user {
          id
          preferredName
        }
        isSelf
        team {
          isOrgAdmin
          teamLead {
            isSelf
            user {
              preferredName
            }
          }
        }
      }
    `,
    teamMemberRef
  )
  const {teamId, user, team, isSelf} = teamMember
  const {id: userId, preferredName} = user
  const {isOrgAdmin, teamLead} = team ?? {}
  const oldLeadName = teamLead?.user.preferredName ?? ''
  const isOldLeadSelf = teamLead?.isSelf
  const handleClick = () => {
    submitMutation()
    PromoteToTeamLeadMutation(atmosphere, {teamId, userId}, {onError, onCompleted})
    closePortal()
  }

  const copyStart = `Are you sure? ${isOldLeadSelf ? 'You' : oldLeadName} will be removed as the team leader and ${isSelf ? 'you' : preferredName} will be promoted.`
  const copyEnd =
    isOldLeadSelf && isOrgAdmin
      ? ''
      : `${isOldLeadSelf ? 'You' : upperFirst(oldLeadName)} will no longer be able to change team membership.`
  const copy = `${copyStart} ${copyEnd}`

  return (
    <Dialog isOpen={isOpen} onClose={closePortal}>
      <DialogContent>
        <DialogTitle>Are you sure?</DialogTitle>
        <p>{copy}</p>
        <PrimaryButton
          size='medium'
          className='mx-auto mt-6 mb-0'
          onClick={handleClick}
          waiting={submitting}
        >
          <IconLabel
            icon='arrow_forward'
            iconAfter
            label={<div className='break-word whitespace-normal'>Yes, promote {preferredName}</div>}
          />
        </PrimaryButton>
      </DialogContent>
    </Dialog>
  )
}

export default PromoteTeamMemberModal
