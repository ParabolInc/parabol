import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {OrgTeams_organization$key} from '../../../../__generated__/OrgTeams_organization.graphql'
import AddTeamDialogRoot from '../../../../components/AddTeamDialogRoot'
import {Button} from '../../../../ui/Button/Button'
import {useDialogState} from '../../../../ui/Dialog/useDialogState'
import plural from '../../../../utils/plural'
import OrgTeamsRow from './OrgTeamsRow'
import TeaserOrgTeamsRow from './TeaserOrgTeamsRow'

type Props = {
  organizationRef: OrgTeams_organization$key
}

const OrgTeams = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment OrgTeams_organization on Organization {
        id
        tier
        hasPublicTeamsFlag: featureFlag(featureName: "publicTeams")
        allTeams {
          id
          ...OrgTeamsRow_team
        }
        viewerTeams {
          id
        }
        allTeamsCount
      }
    `,
    organizationRef
  )

  const {
    open: openAddTeamDialog,
    close: closeAddTeamDialog,
    isOpen: isAddTeamDialogOpened
  } = useDialogState()

  const {allTeams, tier, viewerTeams, allTeamsCount, hasPublicTeamsFlag} = organization
  const showAllTeams = allTeams.length === allTeamsCount || hasPublicTeamsFlag
  const viewerTeamCount = viewerTeams.length

  return (
    <div className='max-w-4xl pb-4'>
      <div className='flex items-center justify-center py-1'>
        <div>
          <h1 className='text-2xl font-semibold leading-7'>Teams</h1>
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

      <div className='shadow-xs overflow-hidden rounded-md border border-slate-300 bg-white'>
        <div className='bg-slate-100 px-4 py-2'>
          <div className='flex w-full justify-between'>
            <div className='flex items-center font-bold'>
              {allTeamsCount} {plural(allTeamsCount, 'Team')}{' '}
              {!showAllTeams ? `(${allTeamsCount - viewerTeamCount} hidden)` : null}
            </div>
          </div>
        </div>
        <div className='divide-y divide-slate-300 border-y border-slate-300'>
          {allTeams.map((team) => (
            <OrgTeamsRow key={team.id} teamRef={team} />
          ))}
        </div>

        {tier !== 'enterprise' && allTeamsCount > viewerTeamCount && !showAllTeams && (
          <TeaserOrgTeamsRow
            hiddenTeamCount={allTeamsCount - viewerTeamCount}
            orgId={organization.id}
          />
        )}
      </div>

      {isAddTeamDialogOpened ? (
        <AddTeamDialogRoot onAddTeam={closeAddTeamDialog} onClose={closeAddTeamDialog} />
      ) : null}
    </div>
  )
}

export default OrgTeams
