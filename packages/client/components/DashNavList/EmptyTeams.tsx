import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useClientQuery, useFragment} from 'react-relay'
import {EmptyTeams_organization$key} from '../../__generated__/EmptyTeams_organization.graphql'
import {EmptyTeamsQuery} from '../../__generated__/EmptyTeamsQuery.graphql'
import {DialogActions} from '../../ui/Dialog/DialogActions'
import AddTeamDialogRoot from '../AddTeamDialogRoot'
import PublicTeamsModal from './PublicTeamsModal'

interface Props {
  organizationRef: EmptyTeams_organization$key
}

const EmptyTeams = (props: Props) => {
  const {organizationRef} = props

  const organization = useFragment(
    graphql`
      fragment EmptyTeams_organization on Organization {
        name
        publicTeams {
          id
          ...PublicTeamsModal_team
        }
      }
    `,
    organizationRef
  )
  const {publicTeams} = organization
  const hasPublicTeams = publicTeams.length > 0

  const viewer = useClientQuery<EmptyTeamsQuery>(
    graphql`
      query EmptyTeamsQuery {
        viewer {
          isNewUser
        }
      }
    `,
    {}
  )
  const {isNewUser} = viewer.viewer

  const [showPublicTeams, setShowPublicTeams] = useState(!!isNewUser && hasPublicTeams)
  const [showAddTeamDialog, setShowAddTeamDialog] = useState(!!isNewUser && !hasPublicTeams)

  return (
    <>
      <div className='w-full rounded-md bg-white px-4 py-2 leading-5'>
        <p>You are not a member of any teams yet.</p>
        <p>
          {hasPublicTeams && (
            <>
              <a className='cursor-pointer text-sky-500' onClick={() => setShowPublicTeams(true)}>
                Browse Teams
              </a>
              {' to join, or '}
            </>
          )}
          <a className='cursor-pointer text-sky-500' onClick={() => setShowAddTeamDialog(true)}>
            Add a Team
          </a>
        </p>
      </div>
      <PublicTeamsModal
        orgName={organization.name}
        teamsRef={publicTeams}
        isOpen={showPublicTeams}
        onClose={() => setShowPublicTeams(false)}
        actions={
          <DialogActions className='justify-start'>
            <a
              className='cursor-pointer text-sky-500'
              onClick={() => {
                setShowPublicTeams(false)
                setShowAddTeamDialog(true)
              }}
            >
              Add a Team
            </a>
          </DialogActions>
        }
      />
      {showAddTeamDialog && (
        <AddTeamDialogRoot
          onTeamAdded={() => setShowAddTeamDialog(false)}
          onClose={() => setShowAddTeamDialog(false)}
        />
      )}
    </>
  )
}
export default EmptyTeams
