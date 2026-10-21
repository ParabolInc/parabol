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
  const {id: orgId, reportPins} = useFragment(
    graphql`
      fragment ReportPinGrid_organization on Organization {
        id
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
      <h2 className='m-0 font-semibold text-base'>Pinned</h2>
      <div className='grid grid-cols-[repeat(auto-fit,minmax(min(440px,100%),1fr))] items-stretch gap-4'>
        {reportPins.map((pin) => (
          <ReportCard key={pin.id} pinRef={pin} orgId={orgId} period={period} />
        ))}
      </div>
    </section>
  )
}

export default ReportPinGrid
