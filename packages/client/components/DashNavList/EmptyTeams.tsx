import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {EmptyTeams_organization$key} from '../../__generated__/EmptyTeams_organization.graphql'
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
  const [showPublicTeams, setShowPublicTeams] = useState(false)
  const [showAddTeamDialog, setShowAddTeamDialog] = useState(false)

  const hasPublicTeams = publicTeams.length > 0

  return (
    <>
      <div className='w-full rounded-md bg-white px-4 py-2'>
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
