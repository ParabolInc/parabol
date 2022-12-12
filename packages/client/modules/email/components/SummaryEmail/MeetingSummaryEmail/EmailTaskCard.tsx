import graphql from 'babel-plugin-relay/macro'
import {convertFromRaw, Editor, EditorState} from 'draft-js'
import editorDecorators from 'parabol-client/components/TaskEditor/decorators'
import {PALETTE} from 'parabol-client/styles/paletteV3'
import {FONT_FAMILY} from 'parabol-client/styles/typographyV2'
import {taskStatusColors} from 'parabol-client/utils/taskStatus'
import {EmailTaskCard_task} from 'parabol-client/__generated__/EmailTaskCard_task.graphql'
import React, {useMemo, useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import convertToTaskContent from '../../../../../utils/draftjs/convertToTaskContent'
import {TaskStatusEnum} from '../../../../../__generated__/EmailTaskCard_task.graphql'

interface Props {
  task: EmailTaskCard_task | null
  maxWidth?: number
}

const contentStyle = (maxWidth?: number): React.CSSProperties => {
  return {
    backgroundColor: '#FFFFFF',
    borderColor: PALETTE.SLATE_400,
    borderRadius: '4px',
    borderStyle: 'solid',
    borderWidth: '1px',
    boxSizing: 'content-box',
    color: PALETTE.SLATE_700,
    fontFamily: FONT_FAMILY.SANS_SERIF,
    fontSize: '14px',
    minHeight: '88px',
    lineHeight: '20px',
    padding: '4px 12px 12px',
    textAlign: 'left',
    verticalAlign: 'top',
    width: maxWidth ? undefined : 188,
    minWidth: 188,
    maxWidth: maxWidth ? maxWidth : 188
  }
}

const statusStyle = (status: TaskStatusEnum) => ({
  backgroundColor: taskStatusColors[status],
  borderRadius: '4px',
  width: 30
})

const deletedTask = {
  content: convertToTaskContent('<<TASK DELETED>>'),
  status: 'done',
  tags: [] as string[],
  user: {
    picture: null,
    preferredName: null
  }
} as const

const EmailTaskCard = (props: Props) => {
  const {task, maxWidth} = props
  const {content, status} = task || deletedTask
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
        <table align='center' width={maxWidth ? undefined : '188'} style={contentStyle(maxWidth)}>
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
