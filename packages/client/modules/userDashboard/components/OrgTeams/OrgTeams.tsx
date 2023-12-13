import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import OrgTeamsRow from './OrgTeamsRow'
import {OrgTeams_organization$key} from '../../../../__generated__/OrgTeams_organization.graphql'
import AddTeamDialogRoot from '../../../../components/AddTeamDialogRoot'
import {Button} from '../../../../ui/Button/Button'
import {useDialogState} from '../../../../ui/Dialog/useDialogState'

type Props = {
  organizationRef: OrgTeams_organization$key
}

const OrgTeams = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment OrgTeams_organization on Organization {
        id
        isBillingLeader
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

  const {allTeams, isBillingLeader} = organization
  if (!isBillingLeader) return null

  return (
    <div className='max-w-4xl'>
      <div className='flex items-center justify-center py-1'>
        <h1 className='flex-1 text-2xl font-semibold leading-7'>Teams</h1>
        <div className='ml-auto'>
          <Button
            variant='secondary'
            shape='pill'
            className='text-md w-32 py-2'
            onClick={openAddTeamDialog}
          >
            Add team
          </Button>
        </div>
      </div>

      <div className='divide-y divide-slate-300 overflow-hidden rounded border border-slate-300 bg-white'>
        <div className='bg-slate-100 px-4 py-2'>
          <div className='flex w-full justify-between px-4'>
            <div className='flex items-center font-bold'>{allTeams.length} Teams</div>
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
