import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {TeamPromptPhoneAppBar_meeting$key} from '~/__generated__/TeamPromptPhoneAppBar_meeting.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import {useMeetingSeriesDate} from '~/hooks/useMeetingSeriesDate'
import {EditMeetingSeriesModal} from '../../../EditMeetingSeriesModal'
import LogoBlock from '../../../LogoBlock/LogoBlock'
import {EndRecurringMeetingModal} from '../../../Recurrence/EndRecurringMeetingModal'
import TeamPromptOptions from '../../TeamPromptOptions'
import countUnsharedDrafts from '../countUnsharedDrafts'
import TeamUpdatesAvatarStack from '../TeamUpdatesAvatarStack'
import {getMemberSharedAt} from '../teamPromptStages'
import TeamPromptPhoneAppBarSubtitle from './TeamPromptPhoneAppBarSubtitle'

interface Props {
  meetingRef: TeamPromptPhoneAppBar_meeting$key
}

const TeamPromptPhoneAppBar = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment TeamPromptPhoneAppBar_meeting on TeamPromptMeeting {
        id
        name
        endedAt
        scheduledEndTime
        responses {
          userId
          sharedAt
          content
        }
        meetingSeries {
          id
          cancelledAt
          nextMeetingDate
          ...EditMeetingSeriesModal_series
        }
        phases {
          ... on TeamPromptResponsesPhase {
            stages {
              teamMember {
                user {
                  id
                  preferredName
                  picture
                }
              }
              responses {
                sharedAt
                updatedAt
              }
            }
          }
        }
        ...useMeetingSeriesDate_meeting
        ...TeamPromptOptions_meeting
        ...EndRecurringMeetingModal_meeting
      }
    `,
    meetingRef
  )
  const {viewerId} = useAtmosphere()
  const [isRecurrenceSettingsOpen, setIsRecurrenceSettingsOpen] = useState(false)
  const [isEndRecurringMeetingOpen, setIsEndRecurringMeetingOpen] = useState(false)
  const {id: meetingId, name, endedAt, scheduledEndTime, responses} = meeting
  const {label: dateLabel} = useMeetingSeriesDate(meeting)
  const meetingSeries = meeting.meetingSeries
  const hasSeries = !!meetingSeries && !meetingSeries.cancelledAt
  const sharedMembers = (meeting.phases[0]?.stages ?? [])
    .filter((stage) => getMemberSharedAt(stage.responses))
    .map((stage) => stage.teamMember.user)
  return (
    <header className='flex h-14 shrink-0 items-center gap-2 border-hairline border-b border-solid bg-surface-card px-3'>
      <LogoBlock className='shrink-0 items-center p-0 [&_img]:w-7' />
      <div className='min-w-0 flex-1'>
        <h1 className='m-0 truncate font-semibold text-[15px] leading-5'>{name}</h1>
        <TeamPromptPhoneAppBarSubtitle
          dateLabel={dateLabel}
          endedAt={endedAt}
          scheduledEndTime={scheduledEndTime}
        />
      </div>
      <TeamUpdatesAvatarStack members={sharedMembers} />
      <TeamPromptOptions
        compact
        meetingRef={meeting}
        openRecurrenceSettingsModal={() => setIsRecurrenceSettingsOpen(true)}
        openEndRecurringMeetingModal={() => setIsEndRecurringMeetingOpen(true)}
      />
      <EditMeetingSeriesModal
        seriesRef={meetingSeries}
        meetingId={meetingId}
        defaultTitle={name}
        isOpen={isRecurrenceSettingsOpen}
        onClose={() => setIsRecurrenceSettingsOpen(false)}
      />
      <EndRecurringMeetingModal
        meetingRef={meeting}
        isOpen={isEndRecurringMeetingOpen}
        hasSeries={hasSeries}
        nextMeetingDate={hasSeries ? meetingSeries.nextMeetingDate : undefined}
        hasUnsharedDraft={countUnsharedDrafts(responses, viewerId) > 0}
        closeModal={() => setIsEndRecurringMeetingOpen(false)}
      />
    </header>
  )
}

export default TeamPromptPhoneAppBar
