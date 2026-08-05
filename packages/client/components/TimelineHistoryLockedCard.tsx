import {Lock} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useEffect, useRef} from 'react'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router'
import type {TimelineHistoryLockedCard_organization$key} from '../__generated__/TimelineHistoryLockedCard_organization.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useIsVisible from '../hooks/useIsVisible'
import SendClientSideEvent from '../utils/SendClientSideEvent'
import PrimaryButton from './PrimaryButton'

interface Props {
  organizationRef: TimelineHistoryLockedCard_organization$key | null
}

const TimelineHistoryLockedCard = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment TimelineHistoryLockedCard_organization on Organization {
        id
        name
        isPaid
        unpaidMessageHTML
      }
    `,
    organizationRef
  )
  const {id: orgId, name: orgName, isPaid, unpaidMessageHTML} = organization ?? {}

  const atmosphere = useAtmosphere()
  const navigate = useNavigate()

  const cardRef = useRef<HTMLDivElement>(null)
  const visible = useIsVisible(cardRef.current, 0.7)
  useEffect(() => {
    if (visible) {
      SendClientSideEvent(atmosphere, 'Upgrade CTA Viewed', {
        upgradeCTALocation: 'timelineHistoryLock',
        upgradeTier: 'team',
        orgId
      })
    }
  }, [visible])

  const onClick = () => {
    SendClientSideEvent(atmosphere, 'Upgrade CTA Clicked', {
      upgradeCTALocation: 'timelineHistoryLock',
      upgradeTier: 'team',
      orgId
    })
    navigate(`/me/organizations/${orgId}/billing`)
  }

  const title = isPaid === false ? 'Organization Locked' : 'Past Meetings Locked'
  const body =
    isPaid === false ? (
      (unpaidMessageHTML && <div dangerouslySetInnerHTML={{__html: unpaidMessageHTML}} />) || (
        <>
          Your organization <>{orgName}</> is currently locked. Please contact your billing leader
          to unlock.
        </>
      )
    ) : (
      <>
        Your plan includes 30 days of meeting history. Unlock the full meeting history of{' '}
        <i>{orgName}</i> by upgrading.
      </>
    )
  const action = isPaid === false ? 'Go To Billing Page' : 'Unlock Past Meetings'

  return (
    <div
      ref={cardRef}
      className='relative mb-4 flex w-full flex-col items-center overflow-hidden rounded bg-surface-card p-[18px] shadow-[var(--shadow-card)]'
    >
      <Lock className='block h-10 w-10 select-none rounded-[100%] text-grape-500' />
      <div className='mx-4 mt-4 mb-2 flex flex-col justify-around pt-[2px] font-semibold text-[20px] text-fg-primary leading-5'>
        {title}
      </div>
      <div className='px-8 pt-1 pb-4 text-center text-sm'>{body}</div>
      <PrimaryButton size='medium' onClick={onClick}>
        {action}
      </PrimaryButton>
    </div>
  )
}

export default TimelineHistoryLockedCard
