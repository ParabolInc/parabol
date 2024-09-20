import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {OrgTeams_organization$key} from '../../../../__generated__/OrgTeams_organization.graphql'
import AddTeamDialogRoot from '../../../../components/AddTeamDialogRoot'
import {Button} from '../../../../ui/Button/Button'
import {useDialogState} from '../../../../ui/Dialog/useDialogState'
import plural from '../../../../utils/plural'
import OrgTeamsRow from './OrgTeamsRow'

type Props = {
  organizationRef: OrgTeams_organization$key
}

const OrgTeams = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment OrgTeams_organization on Organization {
        id
        isOrgAdmin
        hasPublicTeamsFlag: featureFlag(featureName: "publicTeams", scope: Organization)
        allTeams {
          id
          ...OrgTeamsRow_team
        }
      }
    `,
    organizationRef
  )

  const {
    open: openAddTeamDialog,
    close: closeAddTeamDialog,
    isOpen: isAddTeamDialogOpened
  } = useDialogState()

  const {allTeams, isOrgAdmin, hasPublicTeamsFlag} = organization
  const showAllTeams = isOrgAdmin || hasPublicTeamsFlag
  return (
    <div className='max-w-4xl pb-4'>
      <div className='flex items-center justify-center py-1'>
        <div>
          <h1 className='text-2xl font-semibold leading-7'>Teams</h1>
          <p className='text-gray-600 mb-2'>
            {!showAllTeams
              ? "Only showing teams you're a member of"
              : 'Showing all teams in the organization'}
          </p>
        </div>
        <div className='ml-auto'>
          <Button
            variant='secondary'
            shape='pill'
            className='w-32 py-2 text-base'
            onClick={openAddTeamDialog}
          >
            Add team
          </Button>
        </div>
      </div>

      <div className='divide-y divide-slate-300 overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm'>
        <div className='bg-slate-100 px-4 py-2'>
          <div className='flex w-full justify-between'>
            <div className='flex items-center font-bold'>
              {allTeams.length} {plural(allTeams.length, 'Team')}
            </div>
          </div>
        </div>
        {allTeams.map((team) => (
          <OrgTeamsRow key={team.id} teamRef={team} />
        ))}
      </div>

      {isAddTeamDialogOpened ? (
        <AddTeamDialogRoot onAddTeam={closeAddTeamDialog} onClose={closeAddTeamDialog} />
      ) : null}
    </div>
  )
}

export default OrgTeams
