import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {PinnedReportGrid_organization$key} from '../../__generated__/PinnedReportGrid_organization.graphql'
import ReportCard from './ReportCard'
import type {ReportPagePeriod} from './reportPeriodParam'

interface Props {
  organizationRef: PinnedReportGrid_organization$key
  period: ReportPagePeriod
}

const PinnedReportGrid = ({organizationRef, period}: Props) => {
  const {
    id: orgId,
    isBillingLeader,
    pinnedReports
  } = useFragment(
    graphql`
      fragment PinnedReportGrid_organization on Organization {
        id
        isBillingLeader
        pinnedReports {
          id
          ...ReportCard_pin
        }
      }
    `,
    organizationRef
  )
  return (
    <section className='flex flex-col gap-3'>
      <div className='flex flex-wrap items-baseline gap-x-3 gap-y-1'>
        <h2 className='m-0 font-semibold text-base'>Pinned</h2>
        <span className='text-[13px] text-fg-muted'>Shared with everyone who can see Reports</span>
      </div>
      <div className='grid grid-cols-[repeat(auto-fit,minmax(min(440px,100%),1fr))] items-stretch gap-4'>
        {pinnedReports.map((pin, index) => (
          <ReportCard
            key={pin.id}
            pinRef={pin}
            orgId={orgId}
            period={period}
            index={index}
            pinCount={pinnedReports.length}
            isLeader={isBillingLeader}
          />
        ))}
      </div>
    </section>
  )
}

export default PinnedReportGrid
