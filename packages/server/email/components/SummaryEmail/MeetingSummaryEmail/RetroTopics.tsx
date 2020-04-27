import graphql from 'babel-plugin-relay/macro'
import {PALETTE} from 'parabol-client/styles/paletteV2'
import {FONT_FAMILY} from 'parabol-client/styles/typographyV2'
import {RETRO_TOPIC_LABEL} from 'parabol-client/utils/constants'
import plural from 'parabol-client/utils/plural'
import {RetroTopics_meeting} from 'parabol-client/__generated__/RetroTopics_meeting.graphql'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import EmailBorderBottom from './EmailBorderBottom'
import RetroTopic from './RetroTopic'

const sectionHeading = {
  color: PALETTE.TEXT_MAIN,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: 24,
  fontWeight: 600,
  paddingTop: 24
}

interface Props {
  isDemo: boolean
  isEmail: boolean
  meeting: RetroTopics_meeting
  meetingUrl: string
}

const RetroTopics = (props: Props) => {
  const {isDemo, isEmail, meeting, meetingUrl} = props
  const {id: meetingId, reflectionGroups} = meeting
  if (!reflectionGroups) return null
  const toPart = isEmail ? meetingUrl : `/meet/${meetingId}`
  return (
    <>
      <tr>
        <td align='center' style={sectionHeading}>
          {plural(reflectionGroups.length, RETRO_TOPIC_LABEL)}
        </td>
      </tr>
      {reflectionGroups.map((topic, idx) => (
        <RetroTopic
          key={topic.id}
          isDemo={isDemo}
          isEmail={isEmail}
          topic={topic}
          to={`${toPart}/discuss/${idx + 1}`}
        />
      ))}
      <EmailBorderBottom />
    </>
  )
}

export default createFragmentContainer(RetroTopics, {
  meeting: graphql`
    fragment RetroTopics_meeting on RetrospectiveMeeting {
      id
      reflectionGroups(sortBy: stageOrder) {
        id
        ...RetroTopic_topic
      }
    }
  `
})
