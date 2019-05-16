import {convertFromRaw, Editor, EditorState} from 'draft-js'
import React, {useMemo, useRef} from 'react'
import ui from 'universal/styles/ui'
import {
  FONT_FAMILY,
  PALETTE_TEXT_LIGHT,
  PALETTE_TEXT_MAIN
} from 'universal/modules/email/components/SummaryEmail/MeetingSummaryEmail/constants'
import {createFragmentContainer, graphql} from 'react-relay'
import editorDecorators from 'universal/components/TaskEditor/decorators'
import {EmailReflectionCard_reflection} from '__generated__/EmailReflectionCard_reflection.graphql'

interface Props {
  reflection: EmailReflectionCard_reflection
}

const contentStyle = {
  backgroundColor: '#ffffff',
  borderColor: ui.cardBorderColor,
  borderRadius: '4px',
  borderStyle: 'solid',
  borderWidth: '1px',
  boxSizing: 'content-box',
  color: PALETTE_TEXT_MAIN,
  fontFamily: FONT_FAMILY,
  fontSize: '14px',
  minHeight: '88px',
  lineHeight: '20px',
  paddingTop: 4,
  paddingLeft: 4,
  textAlign: 'left',
  verticalAlign: 'top',
  width: 188,
  minWidth: 188,
  maxWidth: 188
} as React.CSSProperties

const reflectionCardFooter = {
  color: PALETTE_TEXT_LIGHT,
  fontFamily: FONT_FAMILY,
  fontSize: 11,
  paddingLeft: 4
}

const EmailReflectionCard = (props: Props) => {
  const {reflection} = props
  const {content, phaseItem} = reflection
  const {question} = phaseItem
  const contentState = useMemo(() => convertFromRaw(JSON.parse(content)), [content])
  const editorStateRef = useRef<EditorState>()
  const getEditorState = () => {
    return editorStateRef.current
  }
  editorStateRef.current = EditorState.createWithContent(
    contentState,
    editorDecorators(getEditorState)
  )
  return (
    <tr>
      <td>
        <table align='center' width='188' style={contentStyle}>
          <tbody>
            <tr>
              <td>
                <table align='center' width='100%'>
                  <tbody>
                    <tr>
                      <td>
                        <Editor
                          readOnly
                          editorState={editorStateRef.current}
                          onChange={() => {
                            /**/
                          }}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
            <tr>
              <td style={reflectionCardFooter}>{question}</td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  )
}

export default createFragmentContainer(
  EmailReflectionCard,
  graphql`
    fragment EmailReflectionCard_reflection on RetroReflection {
      content
      phaseItem {
        question
      }
    }
  `
)
