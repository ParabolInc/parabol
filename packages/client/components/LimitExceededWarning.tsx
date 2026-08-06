import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {LimitExceededWarning_organization$key} from '../__generated__/LimitExceededWarning_organization.graphql'
import {Threshold} from '../types/constEnums'
import relativeDate from '../utils/date/relativeDate'

interface Props {
  organizationRef: LimitExceededWarning_organization$key
  domainId?: string
}

const LimitExceededWarning = (props: Props) => {
  const {organizationRef, domainId} = props
  const organization = useFragment(
    graphql`
      fragment LimitExceededWarning_organization on Organization {
        name
        scheduledLockAt
      }
    `,
    organizationRef
  )
  const {scheduledLockAt, name: orgName} = organization
  const isLocked = scheduledLockAt
    ? new Date(scheduledLockAt).getTime() <= new Date().getTime()
    : false

  return (
    <div className='flex w-full flex-wrap rounded-[2px] bg-gold-100 text-[16px] text-slate-900 leading-6'>
      <div className='rounded-[2px] bg-gold-100 p-4 font-medium text-[16px] leading-[26px]'>
        <span className='font-semibold'>{domainId ?? orgName}</span>
        {` is over the limit of `}
        <span className='font-semibold'>{`${Threshold.MAX_STARTER_TIER_TEAMS} free teams`}</span>
        {scheduledLockAt && !isLocked && (
          <>
            {`. Your free access will end in `}
            <span className='font-semibold'>{`${relativeDate(scheduledLockAt)}.`}</span>
          </>
        )}
        {isLocked && `. Please upgrade to continue using Parabol.`}
      </div>
    </div>
  )
}

export default LimitExceededWarning
