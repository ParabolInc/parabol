import {convertFromRaw, Editor, EditorState} from 'draft-js'
import React, {useMemo, useRef} from 'react'
import editorDecorators from '../../../../../components/TaskEditor/decorators'
import labels from '../../../../../styles/theme/labels'
import ui from '../../../../../styles/ui'
import {createFragmentContainer, graphql} from 'react-relay'
import {EmailTaskCard_task} from '../../../../../__generated__/EmailTaskCard_task.graphql'
import {
  FONT_FAMILY,
  PALETTE_TEXT_MAIN
} from './constants'

interface Props {
  task: EmailTaskCard_task
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
  padding: '4px 12px 12px',
  textAlign: 'left',
  verticalAlign: 'top',
  width: 188,
  minWidth: 188,
  maxWidth: 188
} as React.CSSProperties

const statusStyle = (status: string) => ({
  backgroundColor: labels.taskStatus[status].color,
  borderRadius: '4px',
  width: 30
})

const EmailTaskCard = (props: Props) => {
  const {task} = props
  const {content, status} = task
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
                <table align='left' width={'20%'}>
                  <tbody>
                    <tr>
                      <td style={statusStyle(status)} height={4} />
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
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
          </tbody>
        </table>
      </td>
    </tr>
  )
}

export default createFragmentContainer(EmailTaskCard, {
  task: graphql`
    fragment EmailTaskCard_task on Task {
      content
      status
    }
  `
})
