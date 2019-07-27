import React from 'react'
import {MD_ICONS_SIZE_18} from '../../../../../styles/icons'
import emailDir from '../../../emailDir'
import {
  FONT_FAMILY,
  PALETTE_TEXT_MAIN
} from './constants'
import useEmailItemGrid from '../../../../../hooks/useEmailItemGrid'
import EmailReflectionCard from './EmailReflectionCard'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {RetroTopic_topic} from '../../../../../__generated__/RetroTopic_topic.graphql'

const topicThemeHeading = {
  color: PALETTE_TEXT_MAIN,
  fontFamily: FONT_FAMILY,
  fontSize: 16,
  fontWeight: 600,
  paddingTop: 16
}

const votesBlock = {
  fontSize: 14,
  fontWeight: 600,
  lineHeight: MD_ICONS_SIZE_18
}

const voteCountStyle = {
  paddingLeft: 4
}

const imageStyle = {
  verticalAlign: 'text-bottom'
}

interface Props {
  imageSource: 'local' | 'static'
  topic: RetroTopic_topic
}
const RetroTopic = (props: Props) => {
  const {imageSource, topic} = props
  const {reflections, title, voteCount} = topic
  const icon = imageSource === 'local' ? 'thumb_up_18.svg' : 'thumb_up_18@3x.png'
  const src = `${emailDir}${icon}`
  const grid = useEmailItemGrid(reflections, 3)
  return (
    <>
      <tr>
        <td align='center' style={topicThemeHeading}>
          {`“${title}”`}
        </td>
      </tr>
      <tr>
        <td align='center' style={votesBlock}>
          <img height='18' src={src} width='18' style={imageStyle} />
          <span style={voteCountStyle}>{voteCount}</span>
        </td>
      </tr>
      <tr>
        <td>
          {grid((reflectionCard) => (
            <EmailReflectionCard reflection={reflectionCard} />
          ))}
        </td>
      </tr>
    </>
  )
}

export default createFragmentContainer(RetroTopic, {
  topic: graphql`
    fragment RetroTopic_topic on RetroReflectionGroup {
      title
      voteCount
      reflections {
        ...EmailReflectionCard_reflection
      }
    }
  `
})
