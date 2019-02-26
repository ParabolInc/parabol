// @flow
import React from 'react'
import EmptySpace from '../../components/EmptySpace/EmptySpace'
import ui from 'universal/styles/ui'
import arrayToRows from '../../helpers/arrayToRows'
import ReflectionEditorWrapperForEmail from 'universal/components/ReflectionEditorWrapperForEmail'
import {MD_ICONS_SIZE_18} from 'universal/styles/icons'
import emailDir from 'universal/modules/email/emailDir'

const fontFamily = ui.emailFontFamily

const tableStyle = {
  ...ui.emailTableBase
}

const cardCell = {
  padding: '8px',
  textAlign: 'left',
  verticalAlign: 'top',
  width: '188px'
}

const topicThemeHeading = {
  fontFamily,
  fontSize: '16px',
  fontWeight: 600,
  textAlign: 'center'
}

const votesBlock = {
  fontSize: '14px',
  fontWeight: 600,
  lineHeight: MD_ICONS_SIZE_18,
  textAlign: 'center'
}

const voteIcon = {
  display: 'inline-block',
  height: MD_ICONS_SIZE_18,
  margin: '0 2px 0 0',
  verticalAlign: 'top',
  width: MD_ICONS_SIZE_18
}

const voteCountLabel = {
  color: ui.palette.midGray,
  display: 'inline-block',
  height: MD_ICONS_SIZE_18,
  lineHeight: MD_ICONS_SIZE_18,
  verticalAlign: 'top'
}

const reflectionCard = {
  backgroundColor: 'white',
  border: `1px solid ${ui.cardBorderColor}`,
  borderRadius: '4px',
  fontFamily,
  fontSize: '13px',
  margin: 0,
  padding: 0
}

const reflectionCardFooter = {
  color: ui.palette.midGray,
  fontFamily,
  fontSize: '11px',
  padding: '0 .5rem .5rem'
}

type Reflection = {
  id: string,
  content: string
}
type Topic = {
  reflections: Array<Reflection>,
  title: string,
  voteCount: number
}

type Props = {
  imageSource: 'local' | 'static',
  topic: Topic
}

const RetroDiscussionTopic = (props: Props) => {
  const {imageSource, topic} = props
  const {reflections, title, voteCount} = topic
  const rows = arrayToRows(reflections)
  const icon = imageSource === 'local' ? 'thumb_up_18.svg' : 'thumb_up_18@3x.png'
  const src = `${emailDir}${icon}`
  return (
    <table style={tableStyle} width='100%'>
      <tbody>
        <tr>
          <td>
            <EmptySpace height={16} />
            <div style={topicThemeHeading}>{`“${title}”`}</div>
          </td>
        </tr>
        <tr>
          <td style={votesBlock}>
            <img height='18' src={src} style={voteIcon} width='18' />
            <div style={voteCountLabel}>{voteCount}</div>
          </td>
        </tr>
        <tr>
          <td>
            <table style={tableStyle}>
              <tbody>
                {rows.map((row, idx) => (
                  // eslint-disable-next-line
                  <tr key={idx}>
                    {row.map(({id, content, phaseItem: {question}}) => (
                      <td key={id} style={cardCell}>
                        <div style={reflectionCard}>
                          <ReflectionEditorWrapperForEmail content={content} />
                          <div style={reflectionCardFooter}>{question}</div>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <EmptySpace height={16} />
          </td>
        </tr>
      </tbody>
    </table>
  )
}

export default RetroDiscussionTopic
