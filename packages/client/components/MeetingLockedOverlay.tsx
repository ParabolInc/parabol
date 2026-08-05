import {Lock} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {lazy, Suspense, useEffect} from 'react'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router'
import type {MeetingLockedOverlay_meeting$key} from '~/__generated__/MeetingLockedOverlay_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import SendClientSideEvent from '../utils/SendClientSideEvent'
import PrimaryButton from './PrimaryButton'

const UnpaidTeamModalRoot = lazy(
  () =>
    import(
      /* webpackChunkName: 'UnpaidTeamModalRoot' */ '../modules/teamDashboard/containers/UnpaidTeamModal/UnpaidTeamModalRoot'
    )
)

interface Props {
  meetingRef: MeetingLockedOverlay_meeting$key
}

const MeetingLockedOverlay = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment MeetingLockedOverlay_meeting on NewMeeting {
        id
        locked
        teamId
        organization {
          id
          name
          isPaid
          viewerOrganizationUser {
            id
          }
        }
      }
    `,
    meetingRef
  )
  const {id: meetingId, teamId, locked, organization} = meeting

  const atmosphere = useAtmosphere()
  const navigate = useNavigate()
  useEffect(() => {
    if (locked) {
      SendClientSideEvent(atmosphere, 'Upgrade CTA Viewed', {
        upgradeCTALocation: 'directMeetingLinkLock',
        upgradeTier: 'team',
        meetingId
      })
    }
  }, [locked])

  useEffect(() => {
    if (locked) {
      // lock scrolling of the background, not super critical but looks nicer without scroll bar
      const prevOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prevOverflow
      }
    }
    return undefined
  }, [locked])

  if (!locked) return null
  // organization is a linked record that can be transiently absent from the Relay store.
  // It's only needed when the overlay actually renders (locked), so read it after the guard.
  if (!organization) return null
  const {id: orgId, name: orgName, viewerOrganizationUser, isPaid} = organization
  const canUpgrade = !!viewerOrganizationUser

  const onClick = () => {
    SendClientSideEvent(atmosphere, 'Upgrade CTA Clicked', {
      upgradeCTALocation: 'directMeetingLinkLock',
      upgradeTier: 'team',
      meetingId
    })
    navigate(`/me/organizations/${orgId}`)
  }

  if (!isPaid) {
    return (
      <Suspense fallback={''}>
        <UnpaidTeamModalRoot teamId={teamId} />
      </Suspense>
    )
  }

  return (
    <div className='fixed top-0 z-[100] flex h-full w-full flex-col items-center justify-center overflow-y-auto backdrop-blur-[3px]'>
      <div className='mb-[100px] flex max-h-[90vh] w-[512px] min-w-[280px] max-w-[calc(100vw-48px)] flex-col items-center rounded-lg bg-surface-card p-6 shadow-[var(--shadow-dialog)]'>
        <Lock className='block h-10 w-10 select-none rounded-full text-grape-500' />
        <div className='mx-4 mt-4 mb-2 flex flex-col justify-around pt-[2px] font-semibold text-fg-primary text-sm leading-5'>
          Past Meetings Locked
        </div>
        {canUpgrade ? (
          <>
            <div className='px-12 pt-1 pb-4 text-center text-sm leading-5'>
              Your plan includes 30 days of meeting history. Unlock the full meeting history of{' '}
              <i>{orgName}</i> by upgrading.
            </div>
            <PrimaryButton onClick={onClick}>Unlock Past Meetings</PrimaryButton>
          </>
        ) : (
          <>
            <div className='px-12 pt-1 pb-4 text-center text-sm leading-5'>
              The plan of <i>{orgName}</i> includes only 30 days of meeting history.
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default MeetingLockedOverlay
