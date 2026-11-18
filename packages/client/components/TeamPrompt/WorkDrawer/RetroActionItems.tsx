import graphql from 'babel-plugin-relay/macro'
import dayjs from 'dayjs'
import {useFragment} from 'react-relay'
import type {RetroActionItems_meeting$key} from '../../../__generated__/RetroActionItems_meeting.graphql'
import RetroActionItemRow from './RetroActionItemRow'

interface Props {
  meetingRef: RetroActionItems_meeting$key | null | undefined
}

const RetroActionItems = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment RetroActionItems_meeting on RetrospectiveMeeting {
        createdAt
        tasks {
          id
          plaintextContent
          status
          doneAt
          updatedAt
        }
      }
    `,
    meetingRef
  )
  const tasks = (meeting?.tasks ?? []).filter(({plaintextContent}) => plaintextContent.trim())
  if (!meeting || tasks.length === 0) return null
  return (
    <section
      aria-labelledby='retro-action-items-heading'
      className='flex flex-col gap-1.5 px-4 pt-4'
    >
      <div className='flex items-baseline justify-between gap-2'>
        <h3 id='retro-action-items-heading' className='m-0 font-semibold text-fg-primary text-sm'>
          Last retro, the team agreed to
        </h3>
        <span className='shrink-0 text-fg-muted text-xs'>
          {dayjs(meeting.createdAt).format('MMM D')} retro
        </span>
      </div>
      <ul className='m-0 flex list-none flex-col rounded-lg border border-hairline p-0'>
        {tasks.map(({id, plaintextContent, status, doneAt, updatedAt}) => (
          <RetroActionItemRow
            key={id}
            text={plaintextContent}
            status={status}
            doneAt={doneAt}
            updatedAt={updatedAt}
          />
        ))}
      </ul>
    </section>
  )
}

export default RetroActionItems
