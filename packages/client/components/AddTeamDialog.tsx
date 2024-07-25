import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
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
import {Select} from '../ui/Select/Select'
import {SelectContent} from '../ui/Select/SelectContent'
import {SelectGroup} from '../ui/Select/SelectGroup'
import {SelectItem} from '../ui/Select/SelectItem'
import {SelectTrigger} from '../ui/Select/SelectTrigger'
import {SelectValue} from '../ui/Select/SelectValue'
import FlatPrimaryButton from './FlatPrimaryButton'

interface Props {
  isOpen: boolean
  onClose: () => void
  onAddTeam: (teamId: string) => void
  queryRef: PreloadedQuery<AddTeamDialogQuery>
}

const AddTeamDialogViewerFragment = graphql`
  fragment AddTeamDialog_viewer on User {
    ...AdhocTeamMultiSelect_viewer
    organizations {
      id
      name
    }
  }
`

const query = graphql`
  query AddTeamDialogQuery {
    viewer {
      ...AddTeamDialog_viewer
    }
  }
`

const AddTeamDialog = (props: Props) => {
  const {isOpen, onClose, queryRef, onAddTeam} = props
  const atmosphere = useAtmosphere()

  const {submitting, onCompleted, onError, error, submitMutation} = useMutationProps()
  const {history} = useRouter()

  const data = usePreloadedQuery<AddTeamDialogQuery>(query, queryRef)
  const viewer = useFragment<AddTeamDialog_viewer$key>(AddTeamDialogViewerFragment, data.viewer)
  const {organizations: viewerOrganizations} = viewer

  const [selectedUsers, setSelectedUsers] = useState<Option[]>([])
  const [mutualOrgsIds, setMutualOrgsIds] = useState<string[]>([])

  const showOrgPicker = !!(
    selectedUsers.length &&
    (mutualOrgsIds.length > 1 || !mutualOrgsIds.length) &&
    viewerOrganizations.length > 1
  )

  const defaultOrgId = mutualOrgsIds[0]
  const [selectedOrgId, setSelectedOrgId] = useState(defaultOrgId)
  const [teamName, setTeamName] = useState('')
  const [teamNameManuallyEdited, setTeamNameManuallyEdited] = useState(false)

  const MAX_TEAM_NAME_LENGTH = 50
  const generateTeamName = (newUsers: Option[]) => {
    return newUsers
      .map((user) => (user.id ? user.label : user.email.split('@')[0]))
      .join(', ')
      .substring(0, MAX_TEAM_NAME_LENGTH)
  }

  const onSelectedUsersChange = (newUsers: Option[]) => {
    setSelectedUsers(newUsers)
    const selectedUsersOrganizationIds = new Set()
    newUsers.forEach((user) => {
      //add user.organizationIds to selectedUserOrganizationIds
      user.organizationIds.forEach((organizationId) => {
        selectedUsersOrganizationIds.add(organizationId)
      })
    })

    const mutualOrgs = viewerOrganizations.filter((org) => selectedUsersOrganizationIds.has(org.id))

    const mutualOrgsIds = mutualOrgs.map((org) => org.id)
    setMutualOrgsIds(mutualOrgsIds)
    setSelectedOrgId(mutualOrgsIds[0] ?? viewerOrganizations[0]?.id)

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
      orgId: selectedOrgId
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

  const isValid = selectedUsers.length && teamName.trim()

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

        {showOrgPicker && (
          <fieldset className={fieldsetStyles}>
            <label className={labelStyles}>Organization</label>
            <Select onValueChange={(orgId) => setSelectedOrgId(orgId)} value={selectedOrgId}>
              <SelectTrigger className='bg-white'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {viewerOrganizations
                    .filter((org) => (mutualOrgsIds.length ? mutualOrgsIds.includes(org.id) : true))
                    .map((org) => (
                      <SelectItem value={org.id} key={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </fieldset>
        )}

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
