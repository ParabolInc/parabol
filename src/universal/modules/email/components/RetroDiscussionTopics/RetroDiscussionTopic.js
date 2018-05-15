// @flow
import React from 'react'
import EmptySpace from '../../components/EmptySpace/EmptySpace'
import ui from 'universal/styles/ui'
import arrayToRows from '../../helpers/arrayToRows'
import ReflectionEditorWrapperForEmail from 'universal/components/ReflectionEditorWrapperForEmail'

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
  textAlign: 'center'
}

const voteIcon = {
  display: 'inline-block',
  height: '10px',
  margin: '0 4px',
  width: '14px'
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
  const icon = imageSource === 'local' ? 'fa-check.svg' : 'fa-check@3x.png'
  const src = `/static/images/icons/${icon}`
  const voteRange = [...Array(voteCount).keys()]
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
            {voteRange.map((idx) => (
              <img key={idx} height='10' src={src} style={voteIcon} width='14' />
            ))}
          </td>
        </tr>
        <tr>
          <td>
            <table style={tableStyle}>
              <tbody>
                {rows.map((row, idx) => (
                  // eslint-disable-next-line
                  <tr key={idx}>
                    {row.map(({id, content}) => (
                      <td key={id} style={cardCell}>
                        <div style={reflectionCard}>
                          <ReflectionEditorWrapperForEmail content={content} />
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
