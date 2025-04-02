import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {PreloadedQuery, useFragment, usePreloadedQuery} from 'react-relay'
import useRouter from '~/hooks/useRouter'
import AddTeamMutation from '~/mutations/AddTeamMutation'
import SendClientSideEvent from '~/utils/SendClientSideEvent'
import getGraphQLError from '~/utils/relay/getGraphQLError'
import {AddTeamDialogQuery} from '../__generated__/AddTeamDialogQuery.graphql'
import {AddTeamDialog_viewer$key} from '../__generated__/AddTeamDialog_viewer.graphql'
import {AdhocTeamMultiSelect, Option} from '../components/AdhocTeamMultiSelect/AdhocTeamMultiSelect'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import {Dialog} from '../ui/Dialog/Dialog'
import {DialogActions} from '../ui/Dialog/DialogActions'
import {DialogContent} from '../ui/Dialog/DialogContent'
import {DialogTitle} from '../ui/Dialog/DialogTitle'
import {Input} from '../ui/Input/Input'
import {Tooltip} from '../ui/Tooltip/Tooltip'
import {TooltipContent} from '../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../ui/Tooltip/TooltipTrigger'
import FlatPrimaryButton from './FlatPrimaryButton'
import Toggle from './Toggle/Toggle'

interface Props {
  isOpen: boolean
  onClose: () => void
  onTeamAdded: (teamId: string) => void
  queryRef: PreloadedQuery<AddTeamDialogQuery>
}

const AddTeamDialogViewerFragment = graphql`
  fragment AddTeamDialog_viewer on User {
    ...AdhocTeamMultiSelect_viewer
    organization(orgId: $orgId) {
      id
      name
      tier
    }
  }
`

const query = graphql`
  query AddTeamDialogQuery($orgId: ID!) {
    viewer {
      ...AddTeamDialog_viewer
    }
  }
`

const AddTeamDialog = (props: Props) => {
  const {isOpen, onClose, queryRef, onTeamAdded} = props
  const atmosphere = useAtmosphere()
  const {history} = useRouter()

  const {submitting, onCompleted, onError, error, submitMutation} = useMutationProps()

  const data = usePreloadedQuery<AddTeamDialogQuery>(query, queryRef)
  const viewer = useFragment<AddTeamDialog_viewer$key>(AddTeamDialogViewerFragment, data.viewer)
  const {organization} = viewer

  const [selectedUsers, setSelectedUsers] = useState<Option[]>([])
  const [isPublic, setIsPublic] = useState(true)
  const [teamName, setTeamName] = useState('')

  if (!organization) return null
  const isStarterTier = organization.tier === 'starter'
  const disablePrivacyToggle = isStarterTier

  const goToBilling = () => {
    SendClientSideEvent(atmosphere, 'Upgrade CTA Clicked', {
      upgradeCTALocation: 'createTeam',
      orgId: organization.id,
      upgradeTier: 'team'
    })
    history.push(`/me/organizations/${organization.id}`)
  }

  const onSelectedUsersChange = (newUsers: Option[]) => {
    const prevLength = selectedUsers.length
    setSelectedUsers(newUsers)

    if (newUsers.length && newUsers.length > prevLength) {
      SendClientSideEvent(atmosphere, 'Teammate Selected', {
        selectionLocation: 'addTeamUserPicker'
      })
    }
  }

  const handleAddTeam = () => {
    const newTeam = {
      name: teamName,
      orgId: organization.id,
      isPublic
    }
    submitMutation()

    AddTeamMutation(
      atmosphere,
      {newTeam, invitees: selectedUsers.map((user) => user.email)},
      {
        onError,
        onCompleted: (res, errors) => {
          onCompleted(res, errors)
          const error = getGraphQLError(res, errors)
          if (!error) {
            onTeamAdded(res.addTeam.team.id)
          }
        },
        history,
        showTeamCreatedToast: false
      }
    )
  }

  const isValid = teamName.trim().length > 0

  const labelStyles = `text-left text-sm font-semibold mb-3`
  const fieldsetStyles = `mx-0 mb-6 flex flex-col w-full p-0`

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className='z-10'>
        <DialogTitle className='mb-4'>Add team</DialogTitle>

        <fieldset className={fieldsetStyles}>
          <label className={labelStyles}>Add teammates</label>

          <AdhocTeamMultiSelect
            viewerRef={viewer}
            value={selectedUsers}
            onChange={onSelectedUsersChange}
          />

          {selectedUsers.some((user: Option) => !user.id) && (
            <div className='mt-3 text-xs font-semibold text-slate-700'>
              Email invitations expire in 30 days.
            </div>
          )}
        </fieldset>

        <fieldset className={fieldsetStyles}>
          <label className={labelStyles}>Team name</label>
          <Input
            onChange={(e) => {
              setTeamName(e.target.value)
            }}
            value={teamName}
          />
          {error && (
            <div className='mt-2 text-sm font-semibold text-tomato-500'>{error.message}</div>
          )}
        </fieldset>

        <fieldset className={fieldsetStyles}>
          <div className='flex items-center justify-between'>
            <div className='flex-1'>
              <label className={labelStyles}>Team Privacy</label>
              <div className='mt-1 text-xs text-slate-600'>
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
                          className='cursor-pointer font-semibold text-sky-500 outline-none hover:text-sky-600'
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
          <FlatPrimaryButton
            size='medium'
            onClick={handleAddTeam}
            disabled={submitting || !isValid}
          >
            Add team
          </FlatPrimaryButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

export default AddTeamDialog
