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
import FlatPrimaryButton from './FlatPrimaryButton'
import Toggle from './Toggle/Toggle'

interface Props {
  isOpen: boolean
  onClose: () => void
  onAddTeam: (teamId: string) => void
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
  const {isOpen, onClose, queryRef, onAddTeam} = props
  const atmosphere = useAtmosphere()
  const {history} = useRouter()

  const {submitting, onCompleted, onError, error, submitMutation} = useMutationProps()

  const data = usePreloadedQuery<AddTeamDialogQuery>(query, queryRef)
  const viewer = useFragment<AddTeamDialog_viewer$key>(AddTeamDialogViewerFragment, data.viewer)
  const {organization} = viewer

  const [selectedUsers, setSelectedUsers] = useState<Option[]>([])
  const [isPublic, setIsPublic] = useState(true)
  const [teamName, setTeamName] = useState('')
  const [teamNameManuallyEdited, setTeamNameManuallyEdited] = useState(false)

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

  const MAX_TEAM_NAME_LENGTH = 50
  const generateTeamName = (newUsers: Option[]) => {
    return newUsers
      .map((user) => (user.id ? user.label : user.email.split('@')[0]))
      .join(', ')
      .substring(0, MAX_TEAM_NAME_LENGTH)
  }

  const onSelectedUsersChange = (newUsers: Option[]) => {
    setSelectedUsers(newUsers)
    if (!teamNameManuallyEdited) {
      setTeamName(generateTeamName(newUsers))
    }

    if (newUsers.length && newUsers.length > selectedUsers.length) {
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
            onAddTeam(res.addTeam.team.id)
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
              if (!teamNameManuallyEdited) {
                setTeamNameManuallyEdited(true)
              }
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
              <div className='text-xs text-slate-600'>
                {isPublic ? (
                  disablePrivacyToggle ? (
                    <>
                      Anyone in the organization can join this team. You can make this team private
                      if you{' '}
                      <span
                        onClick={goToBilling}
                        className='cursor-pointer font-semibold text-sky-500 outline-none hover:text-sky-600'
                      >
                        upgrade
                      </span>
                      .
                    </>
                  ) : (
                    <span className='whitespace-nowrap'>
                      Anyone in the organization can join this team
                    </span>
                  )
                ) : (
                  <span className='whitespace-nowrap'>
                    Only invited members can access this team
                  </span>
                )}
              </div>
            </div>
            <div className='flex items-center'>
              <div className='mr-2 text-sm font-medium text-slate-700'>Public</div>
              <Toggle
                active={isPublic}
                disabled={disablePrivacyToggle}
                onClick={() => setIsPublic(!isPublic)}
              />
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
