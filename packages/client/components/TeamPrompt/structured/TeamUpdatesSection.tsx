import graphql from 'babel-plugin-relay/macro'
import type {RefObject} from 'react'
import {useFragment} from 'react-relay'
import type {TeamUpdatesSection_meeting$key} from '~/__generated__/TeamUpdatesSection_meeting.graphql'

interface Props {
  meetingRef: TeamUpdatesSection_meeting$key
  scrollContainerRef: RefObject<HTMLDivElement | null>
}

const TeamUpdatesSection = (props: Props) => {
  const {meetingRef} = props
  useFragment(
    graphql`
      fragment TeamUpdatesSection_meeting on TeamPromptMeeting {
        id
      }
    `,
    meetingRef
  )
  return null
}

export default TeamUpdatesSection
