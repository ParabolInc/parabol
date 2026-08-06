import graphql from 'babel-plugin-relay/macro'
import {type ComponentPropsWithoutRef, forwardRef, useState} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import {Link} from 'react-router'
import type {TeamPromptTopBar_meeting$key} from '~/__generated__/TeamPromptTopBar_meeting.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import {useRenameMeeting} from '~/hooks/useRenameMeeting'
import NewMeetingAvatarGroup from '~/modules/meeting/components/MeetingAvatarGroup/NewMeetingAvatarGroup'
import {KeyboardArrowLeft, KeyboardArrowRight} from '~/ui/icons'
import {cn} from '../../ui/cn'
import SendClientSideEvent from '../../utils/SendClientSideEvent'
import EditableText from '../EditableText'
import IconLabel from '../IconLabel'
import LogoBlock from '../LogoBlock/LogoBlock'
import {IconGroupBlock, MeetingTopBarStyles} from '../MeetingTopBar'
import {EndRecurringMeetingModal} from '../Recurrence/EndRecurringMeetingModal'
import MeetingDateLabel from '../Recurrence/MeetingDateLabel'
import {UpdateRecurrenceSettingsModal} from '../Recurrence/UpdateRecurrenceSettingsModal'
import {TeamPromptMeetingStatus} from './TeamPromptMeetingStatus'
import TeamPromptOptions from './TeamPromptOptions'

const headerTitleClassName = 'm-0 p-0 font-semibold text-[16px] leading-6 xl:text-[18px]'

export const RightSection = ({className, ...props}: ComponentPropsWithoutRef<'div'>) => (
  <IconGroupBlock className={cn('my-auto flex-1 justify-end', className)} {...props} />
)

export const RightSectionContainer = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  (props, ref) => {
    const {className, children, ...rest} = props
    return (
      <div ref={ref} className={cn('flex items-center justify-center', className)} {...rest}>
        {children}
      </div>
    )
  }
)

interface Props {
  meetingRef: TeamPromptTopBar_meeting$key
}

const TeamPromptTopBar = (props: Props) => {
  const {meetingRef} = props

  const meeting = useFragment(
    graphql`
      fragment TeamPromptTopBar_meeting on TeamPromptMeeting {
        id
        name
        teamId
        rightDrawerOpen
        facilitatorUserId
        localStageId
        prevMeeting {
          id
        }
        nextMeeting {
          id
        }
        meetingSeries {
          id
          cancelledAt
          nextMeetingDate
        }
        ...MeetingDateLabel_meeting
        ...TeamPromptOptions_meeting
        ...NewMeetingAvatarGroup_meeting
        ...TeamPromptMeetingStatus_meeting
        ...UpdateRecurrenceSettingsModal_meeting
        ...EndRecurringMeetingModal_meeting
      }
    `,
    meetingRef
  )
  const atmosphere = useAtmosphere()
  const [isRecurrenceSettingsOpen, setIsRecurrenceSettingsOpen] = useState(false)
  const [isEndRecurringMeetingOpen, setIsEndRecurringMeetingOpen] = useState(false)

  const {viewerId} = atmosphere
  const {
    id: meetingId,
    name: meetingName,
    facilitatorUserId,
    meetingSeries,
    prevMeeting,
    nextMeeting
  } = meeting
  const isFacilitator = viewerId === facilitatorUserId
  const {handleSubmit, validate, error} = useRenameMeeting(meetingId)
  const isRecurrenceEnabled = meetingSeries && !meetingSeries.cancelledAt

  const onOpenWorkSidebar = () => {
    if (meeting.rightDrawerOpen === 'inspiration') {
      // If we're clicking on 'Inspiration' when it's already open, just close the drawer.
      commitLocalUpdate(atmosphere, (store) => {
        const meetingProxy = store.get(meetingId)
        if (!meetingProxy) return
        meetingProxy.setValue(null, 'rightDrawerOpen')

        SendClientSideEvent(atmosphere, 'Inspiration Drawer Closed', {
          teamId: meeting.teamId,
          meetingId: meeting.id,
          source: 'top bar'
        })
      })
    } else {
      commitLocalUpdate(atmosphere, (store) => {
        const meetingProxy = store.get(meetingId)
        if (!meetingProxy) return
        meetingProxy.setValue(null, 'localStageId')
        meetingProxy.setValue('inspiration', 'rightDrawerOpen')

        SendClientSideEvent(atmosphere, 'Inspiration Drawer Opened', {
          teamId: meeting.teamId,
          meetingId: meeting.id,
          source: 'top bar'
        })
      })
    }
  }

  const buttons = (
    <div className='ml-4 flex items-center justify-center xl:ml-[10px] xl:h-12 min-[1600px]:h-14'>
      <button
        className='group flex h-max w-max cursor-pointer flex-col items-center bg-transparent px-2 font-semibold text-accent text-sm'
        onClick={onOpenWorkSidebar}
      >
        <IconLabel icon='task_alt' iconLarge />
        <div className='text-fg-primary group-hover:text-fg-primary'>Inspiration</div>
      </button>
      <TeamPromptOptions
        meetingRef={meeting}
        openRecurrenceSettingsModal={() => setIsRecurrenceSettingsOpen(true)}
        openEndRecurringMeetingModal={() => setIsEndRecurringMeetingOpen(true)}
      />
    </div>
  )

  return (
    <>
      <MeetingTopBarStyles>
        <div className='mx-0 my-auto flex flex-1 flex-row items-center justify-start'>
          <LogoBlock className='mr-2 shrink-0 pl-0' />
          <div>
            <div className='flex w-max gap-1'>
              {isRecurrenceEnabled && prevMeeting && (
                <Link className='text-fg-secondary' to={`/meet/${prevMeeting.id}`}>
                  <KeyboardArrowLeft />
                </Link>
              )}
              <div>
                {isFacilitator ? (
                  <EditableText
                    className={headerTitleClassName}
                    error={error?.message}
                    handleSubmit={handleSubmit}
                    initialValue={meetingName}
                    isWrap
                    maxLength={50}
                    validate={validate}
                    placeholder={'Best Meeting Ever!'}
                  />
                ) : (
                  <h1 className={headerTitleClassName}>{meetingName}</h1>
                )}
                <MeetingDateLabel meetingRef={meeting} />
              </div>
              {isRecurrenceEnabled && nextMeeting && (
                <Link className='text-fg-secondary' to={`/meet/${nextMeeting.id}`}>
                  <KeyboardArrowRight />
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className='mx-0 my-auto hidden flex-[2] items-center justify-center md:flex'>
          <TeamPromptMeetingStatus meetingRef={meeting} />
        </div>
        <RightSection>
          <RightSectionContainer>
            <NewMeetingAvatarGroup meetingRef={meeting} />
            <div className='hidden md:block'>{buttons}</div>
          </RightSectionContainer>
        </RightSection>
        <UpdateRecurrenceSettingsModal
          meeting={meeting}
          isOpen={isRecurrenceSettingsOpen}
          closeModal={() => setIsRecurrenceSettingsOpen(false)}
        />
        <EndRecurringMeetingModal
          meetingRef={meeting}
          isOpen={isEndRecurringMeetingOpen}
          nextMeetingDate={isRecurrenceEnabled ? meetingSeries.nextMeetingDate : undefined}
          closeModal={() => setIsEndRecurringMeetingOpen(false)}
        />
      </MeetingTopBarStyles>
      <div className='block flex justify-between border-hairline border-y border-solid px-4 py-2 md:hidden'>
        <div className='my-1'>
          <TeamPromptMeetingStatus meetingRef={meeting} />
        </div>
        {buttons}
      </div>
    </>
  )
}

export default TeamPromptTopBar
