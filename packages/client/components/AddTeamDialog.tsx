import {useNavigate} from '@tanstack/react-router'
import graphql from 'babel-plugin-relay/macro'
import {useId, useState} from 'react'
import {type PreloadedQuery, useFragment, usePreloadedQuery} from 'react-relay'
import AddTeamMutation from '~/mutations/AddTeamMutation'
import getMutationError from '~/utils/relay/getMutationError'
import type {AddTeamDialog_viewer$key} from '../__generated__/AddTeamDialog_viewer.graphql'
import type {AddTeamDialogQuery} from '../__generated__/AddTeamDialogQuery.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import useTeamInviteeDrafts, {isRejected} from '../hooks/useTeamInviteeDrafts'
import {MAX_TEAM_INVITEES} from '../shared/teamInvitees'
import {Button} from '../ui/Button/Button'
import {cn} from '../ui/cn'
import {Dialog} from '../ui/Dialog/Dialog'
import {DialogActions} from '../ui/Dialog/DialogActions'
import {DialogContent} from '../ui/Dialog/DialogContent'
import {DialogTitle} from '../ui/Dialog/DialogTitle'
import {Input} from '../ui/Input/Input'
import {Tooltip} from '../ui/Tooltip/Tooltip'
import {TooltipContent} from '../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../ui/Tooltip/TooltipTrigger'
import plural from '../utils/plural'
import validateTeamInvitees from '../utils/validateTeamInvitees'
import OrgInviteeFieldDirectory from './InviteeField/OrgInviteeFieldDirectory'
import Toggle from './Toggle/Toggle'

interface Props {
  isOpen: boolean
  onClose: () => void
  onTeamAdded: (teamId: string) => void
  queryRef: PreloadedQuery<AddTeamDialogQuery>
}

const AddTeamDialogViewerFragment = graphql`
  fragment AddTeamDialog_viewer on User {
    ...useInviteeDirectory_viewer @arguments(meetingsAfter: $meetingsAfter, meetingsBefore: $meetingsBefore)
    organization(orgId: $orgId) {
      id
      name
      tier
      ...useInviteeDirectory_organization
    }
  }
`

const NO_TEAM_EMAILS: readonly string[] = []

const query = graphql`
  query AddTeamDialogQuery(
    $orgId: ID!
    $meetingsAfter: DateTime!
    $meetingsBefore: DateTime!
  ) {
    viewer {
      ...AddTeamDialog_viewer
    }
  }
`

const AddTeamDialog = (props: Props) => {
  const {isOpen, onClose, queryRef, onTeamAdded} = props
  const atmosphere = useAtmosphere()
  const navigate = useNavigate()

  const {submitting, onCompleted, onError, error, submitMutation} = useMutationProps({
    errorDisplay: 'inline'
  })

  const data = usePreloadedQuery<AddTeamDialogQuery>(query, queryRef)
  const viewer = useFragment<AddTeamDialog_viewer$key>(AddTeamDialogViewerFragment, data.viewer)
  const {organization} = viewer

  const invitees = useTeamInviteeDrafts([])
  const labelId = useId()
  const hintId = useId()
  const [isPublic, setIsPublic] = useState(true)
  const [teamName, setTeamName] = useState('')

  if (!organization) return null
  const isStarterTier = organization.tier === 'starter'
  const disablePrivacyToggle = isStarterTier

  const goToBilling = () => {
    navigate({to: '/me/organizations/$orgId', params: {orgId: organization.id}})
  }

  const excess = invitees.drafts.length - MAX_TEAM_INVITEES
  const isValid = teamName.trim().length > 0 && excess <= 0

  const handleAddTeam = () => {
    if (submitting || !isValid) return
    const pendingText = invitees.inputValue.trim()
    const result = validateTeamInvitees({
      drafts: invitees.commitInput(),
      pendingText,
      hasDirectory: invitees.hasEmailCheck
    })
    if ('error' in result) {
      onError(new Error(result.error))
      return
    }
    const newTeam = {
      name: teamName,
      orgId: organization.id,
      isPublic
    }
    submitMutation()

    AddTeamMutation(
      atmosphere,
      {newTeam, invitees: result.emails},
      {
        onError,
        onCompleted: (res, errors) => {
          onCompleted(res, errors)
          const error = getMutationError(res, errors)
          if (!error) {
            const {team, invitees} = res.addTeam
            const unsentCount = invitees?.filter(isRejected).length ?? 0
            if (unsentCount > 0) {
              const unsent = `${unsentCount} ${plural(unsentCount, 'invitation')} ${unsentCount === 1 ? "wasn't" : "weren't"} sent`
              atmosphere.eventEmitter.emit('addSnackbar', {
                key: `addTeamInvitees:${team.id}`,
                autoDismiss: 15,
                message: `${team.name} was created, but ${unsent}`,
                action: {
                  label: 'Review',
                  callback: () =>
                    navigate({
                      to: '/team/$teamId',
                      params: {teamId: team.id},
                      state: {inviteResults: invitees}
                    })
                }
              })
            }
            onTeamAdded(team.id)
          }
        },
        navigate,
        showTeamCreatedToast: false
      }
    )
  }

  const labelStyles = `text-left text-sm font-semibold mb-3`
  const fieldsetStyles = `mx-0 mb-6 flex flex-col w-full p-0`

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className='z-10'>
        <DialogTitle className='mb-4'>Add team</DialogTitle>

        <fieldset className={fieldsetStyles}>
          <label id={labelId} className={cn(labelStyles, 'mb-1')}>
            Add teammates
          </label>
          <p id={hintId} className='m-0 mb-3 text-fg-secondary text-xs leading-4'>
            Add people by name or email.
          </p>

          <OrgInviteeFieldDirectory
            viewerRef={viewer}
            organizationRef={organization}
            invitees={invitees}
            teamEmails={NO_TEAM_EMAILS}
            targetTeamId={null}
            capacity={MAX_TEAM_INVITEES - invitees.drafts.length}
            labelledBy={labelId}
            describedBy={hintId}
            onSubmit={handleAddTeam}
            autoFocus
          />
        </fieldset>

        <fieldset className={fieldsetStyles}>
          <label className={labelStyles}>Team name</label>
          <Input
            onChange={(e) => {
              setTeamName(e.target.value)
            }}
            value={teamName}
          />
          {error && <div className='mt-2 font-semibold text-fg-error text-sm'>{error.message}</div>}
        </fieldset>

        <fieldset className={fieldsetStyles}>
          <div className='flex items-center justify-between'>
            <div className='flex-1'>
              <label className={labelStyles}>Team Privacy</label>
              <div className='mt-1 text-fg-secondary text-xs'>
                {isPublic ? (
                  <>
                    <div>
                      This team is <b>Public</b>. Anybody in the organization can find and join the
                      team.
                    </div>
                    {disablePrivacyToggle && (
                      <div className='mt-1'>
                        <span
                          onClick={goToBilling}
                          className='cursor-pointer font-semibold text-accent outline-none hover:text-sky-600'
                        >
                          Upgrade
                        </span>{' '}
                        to make private.
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
            <div className='flex items-center'>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Toggle
                      active={!isPublic}
                      disabled={disablePrivacyToggle}
                      onClick={() => setIsPublic(!isPublic)}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>{isPublic ? 'Set to private' : 'Set to public'}</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </fieldset>

        <DialogActions>
          <Button
            variant='primary'
            size='md'
            onClick={handleAddTeam}
            disabled={submitting || !isValid}
          >
            Add team
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

export default AddTeamDialog
