import graphql from 'babel-plugin-relay/macro'
import {useEffect} from 'react'
import {useFragment} from 'react-relay'
import type {NewMeetingActions_team$key} from '~/__generated__/NewMeetingActions_team.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {Threshold} from '../types/constEnums'
import SendClientSideEvent from '../utils/SendClientSideEvent'
import FlatPrimaryButton from './FlatPrimaryButton'
import NewMeetingActionsCurrentMeetings from './NewMeetingActionsCurrentMeetings'
import StyledError from './StyledError'

interface Props {
  error?: {message: string}
  teamRef: NewMeetingActions_team$key
  onStartMeetingClick: () => void
  submitting: boolean
}

const NewMeetingActions = (props: Props) => {
  const {teamRef, onStartMeetingClick, submitting, error} = props
  const team = useFragment(
    graphql`
      fragment NewMeetingActions_team on Team {
        ...NewMeetingActionsCurrentMeetings_team
        id
        organization {
          id
          name
          lockedAt
        }
      }
    `,
    teamRef
  )

  const atmosphere = useAtmosphere()

  const {organization} = team

  const {lockedAt, name: organizationName, id: orgId} = organization

  const isLocked = !!lockedAt

  useEffect(() => {
    if (isLocked) {
      SendClientSideEvent(atmosphere, 'Upgrade CTA Viewed', {
        upgradeCTALocation: 'startNewMeetingOrganizationLockedError',
        orgId
      })
    }
  }, [isLocked])

  return (
    <div className='flex flex-row flex-wrap items-center justify-between p-6 max-[700px]:mt-auto max-[700px]:flex-col max-[700px]:flex-nowrap max-[700px]:content-center max-[700px]:justify-center max-[700px]:self-center'>
      {error && <StyledError className='w-full pb-6'>{error.message}</StyledError>}
      {isLocked && (
        <StyledError className='w-full pb-6'>
          Unfortunately, {organizationName} has exceeded the {Threshold.MAX_STARTER_TIER_TEAMS}{' '}
          teams limit on the Starter Plan for more than {Threshold.STARTER_TIER_LOCK_AFTER_DAYS}{' '}
          days, and your account has been locked. You can re-activate your teams by upgrading your
          account.
        </StyledError>
      )}
      <div className='flex grow-[10] flex-row flex-nowrap items-center max-[700px]:pb-6'>
        <NewMeetingActionsCurrentMeetings team={team} />
      </div>
      <div className='flex flex-row flex-nowrap items-center'>
        <FlatPrimaryButton
          className='h-[50px] text-[20px]'
          onClick={onStartMeetingClick}
          waiting={submitting}
          disabled={isLocked}
        >
          Start Meeting
        </FlatPrimaryButton>
      </div>
    </div>
  )
}

export default NewMeetingActions
