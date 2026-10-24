import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {OrgTeams_organization$key} from '../../../../__generated__/OrgTeams_organization.graphql'
import AddTeamDialogRoot from '../../../../components/AddTeamDialogRoot'
import {Button} from '../../../../ui/Button/Button'
import {cn} from '../../../../ui/cn'
import {useDialogState} from '../../../../ui/Dialog/useDialogState'
import OrgTeamRollup from './OrgTeamRollup'
import OrgTeamStructureLevels from './OrgTeamStructureLevels'
import OrgTeamsTable from './OrgTeamsTable'

type Props = {
  organizationRef: OrgTeams_organization$key
}

const OrgTeams = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment OrgTeams_organization on Organization {
        id
        name
        isBillingLeader
        hasReports: featureFlag(featureName: "Reports")
        teamStructure {
          id
          name
          values {
            id
            name
            teamIds
          }
        }
        teams {
          id
        }
        ...OrgTeamsTable_organization
      }
    `,
    organizationRef
  )

  const {
    open: openAddTeamDialog,
    close: closeAddTeamDialog,
    isOpen: isAddTeamDialogOpened
  } = useDialogState()
  const {id: orgId, name, isBillingLeader, hasReports, teamStructure: levels, teams} = organization
  const hasLevels = levels.length > 0

  return (
    <div className={cn('pb-4', hasReports ? 'max-w-[1184px]' : 'max-w-4xl')}>
      <div
        className={cn(
          'flex justify-center py-1',
          hasReports ? 'flex-wrap items-start gap-x-3 gap-y-2' : 'items-center'
        )}
      >
        <div className={cn(hasReports && 'min-w-0 flex-[1_1_420px]')}>
          <h1 className='font-semibold text-2xl leading-7'>Teams</h1>
          {hasReports && (
            <p className='mt-1 mb-0 max-w-160 text-fg-secondary'>
              Every team in {name}, and where it sits in your structure. Reports roll up by these
              levels.
            </p>
          )}
        </div>
        <div className='ml-auto'>
          <Button variant='secondary' className='w-32 py-2 text-base' onClick={openAddTeamDialog}>
            Add team
          </Button>
        </div>
      </div>

      {hasReports && (isBillingLeader || hasLevels) && (
        <div className='mt-4 mb-5 flex flex-wrap items-start gap-5'>
          {isBillingLeader && (
            <div className='min-w-0 flex-[3_1_560px]'>
              <OrgTeamStructureLevels orgId={orgId} levels={levels} />
            </div>
          )}
          {hasLevels && (
            <div className={cn('min-w-0 flex-[2_1_320px]', !isBillingLeader && 'max-w-xl')}>
              <OrgTeamRollup orgName={name} levels={levels} teamIds={teams.map(({id}) => id)} />
            </div>
          )}
        </div>
      )}
      <OrgTeamsTable organizationRef={organization} />

      <AddTeamDialogRoot
        isOpen={isAddTeamDialogOpened}
        onTeamAdded={closeAddTeamDialog}
        onClose={closeAddTeamDialog}
        orgId={orgId}
      />
    </div>
  )
}

export default OrgTeams
