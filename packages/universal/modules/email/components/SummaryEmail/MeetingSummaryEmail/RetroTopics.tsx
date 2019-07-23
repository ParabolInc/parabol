import React from 'react'
import plural from 'universal/utils/plural'
import {RETRO_TOPIC_LABEL, RETRO_VOTED_LABEL} from 'universal/utils/constants'
import {createFragmentContainer, graphql} from 'react-relay'
import {
  FONT_FAMILY,
  PALETTE_TEXT_MAIN
} from 'universal/modules/email/components/SummaryEmail/MeetingSummaryEmail/constants'
import RetroTopic from 'universal/modules/email/components/SummaryEmail/MeetingSummaryEmail/RetroTopic'
import {RetroTopics_meeting} from '__generated__/RetroTopics_meeting.graphql'
import EmailBorderBottom from 'universal/modules/email/components/SummaryEmail/MeetingSummaryEmail/EmailBorderBottom'

const sectionHeading = {
  color: PALETTE_TEXT_MAIN,
  fontFamily: FONT_FAMILY,
  fontSize: 24,
  fontWeight: 600,
  paddingTop: 24
}

interface Props {
  imageSource: 'local' | 'static'
  meeting: RetroTopics_meeting
}

const RetroTopics = (props: Props) => {
  const {imageSource, meeting} = props
  const {reflectionGroups} = meeting
  if (!reflectionGroups) return null
  return (
    <>
      <tr>
        <td align='center' style={sectionHeading}>
          {plural(reflectionGroups.length, `${RETRO_VOTED_LABEL} ${RETRO_TOPIC_LABEL}`)}
        </td>
      </tr>
      {reflectionGroups.map((topic) => (
        <RetroTopic key={topic.id} imageSource={imageSource} topic={topic} />
      ))}
      <EmailBorderBottom />
    </>
  )
}

export default createFragmentContainer(RetroTopics, {
  meeting: graphql`
    fragment RetroTopics_meeting on RetrospectiveMeeting {
      reflectionGroups(sortBy: voteCount) {
        id
        ...RetroTopic_topic
      }
    }
  `
})
