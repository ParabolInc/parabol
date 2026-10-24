import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {ReportPinGrid_organization$key} from '../../__generated__/ReportPinGrid_organization.graphql'
import ReportCard from './ReportCard'
import type {ReportPagePeriod} from './reportPeriodParam'

interface Props {
  organizationRef: ReportPinGrid_organization$key
  period: ReportPagePeriod
}

const ReportPinGrid = ({organizationRef, period}: Props) => {
  const {
    id: orgId,
    isBillingLeader,
    reportPins
  } = useFragment(
    graphql`
      fragment ReportPinGrid_organization on Organization {
        id
        isBillingLeader
        reportPins {
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
        {reportPins.map((pin, index) => (
          <ReportCard
            key={pin.id}
            pinRef={pin}
            orgId={orgId}
            period={period}
            index={index}
            pinCount={reportPins.length}
            isLeader={isBillingLeader}
          />
        ))}
      </div>
    </section>
  )
}

export default ReportPinGrid
