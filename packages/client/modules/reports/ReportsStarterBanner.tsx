import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {Link} from 'react-router'
import type {ReportsStarterBanner_organization$key} from '../../__generated__/ReportsStarterBanner_organization.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import {Button} from '../../ui/Button/Button'
import SendClientSideEvent from '../../utils/SendClientSideEvent'

interface Props {
  organizationRef: ReportsStarterBanner_organization$key
}

const ReportsStarterBanner = ({organizationRef}: Props) => {
  const {id: orgId, countedTeams} = useFragment(
    graphql`
      fragment ReportsStarterBanner_organization on Organization {
        id
        countedTeams: report(
          spec: {
            measures: [USERS]
            breakdown: [{dimension: TEAM}]
            period: {preset: LAST_7_DAYS}
            showAs: TABLE
          }
          timeZone: $timeZone
        ) {
          rows {
            keys {
              label
            }
          }
          notes {
            kind
            count
          }
        }
      }
    `,
    organizationRef
  )
  const atmosphere = useAtmosphere()
  const leftOutCount = countedTeams.notes.find(({kind}) => kind === 'STARTER_LIMIT')?.count
  if (!leftOutCount) return null
  const teamNames = countedTeams.rows.map(({keys}) => keys[0]?.label)
  const onUpgradeClick = () => {
    SendClientSideEvent(atmosphere, 'Upgrade CTA Clicked', {
      upgradeCTALocation: 'reportsStarterLimit',
      upgradeTier: 'team',
      orgId
    })
  }
  return (
    <section className='flex flex-wrap items-center gap-x-6 gap-y-3 rounded-md border border-hairline bg-surface-card px-5 py-4 shadow-xs'>
      <div className='flex min-w-0 flex-1 basis-80 flex-col gap-0.5'>
        <h2 className='m-0 font-semibold text-base'>
          You’re seeing {teamNames.length} of {teamNames.length + leftOutCount} teams
        </h2>
        <p className='m-0 text-fg-secondary text-sm'>
          Starter shows your 2 busiest teams
          {teamNames.length > 0 && `: ${teamNames.join(' and ')}`}
        </p>
      </div>
      <Button asChild variant='primary' size='md'>
        <Link to={`/me/organizations/${orgId}/billing`} onClick={onUpgradeClick}>
          Upgrade to Team
        </Link>
      </Button>
    </section>
  )
}

export default ReportsStarterBanner
