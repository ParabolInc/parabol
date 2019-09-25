import React from 'react'
import plural from '../../../../../utils/plural'
import {RETRO_TOPIC_LABEL, RETRO_VOTED_LABEL} from '../../../../../utils/constants'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {PALETTE} from '../../../../../styles/paletteV2'
import {FONT_FAMILY} from '../../../../../styles/typographyV2'
import RetroTopic from './RetroTopic'
import {RetroTopics_meeting} from '../../../../../__generated__/RetroTopics_meeting.graphql'
import EmailBorderBottom from './EmailBorderBottom'

const sectionHeading = {
  color: PALETTE.TEXT_MAIN,
  fontFamily: FONT_FAMILY.SANS_SERIF,
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
