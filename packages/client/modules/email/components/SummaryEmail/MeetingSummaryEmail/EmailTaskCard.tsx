import {generateHTML} from '@tiptap/html'
import graphql from 'babel-plugin-relay/macro'
import {EmailTaskCard_task$key} from 'parabol-client/__generated__/EmailTaskCard_task.graphql'
import {PALETTE} from 'parabol-client/styles/paletteV3'
import {FONT_FAMILY} from 'parabol-client/styles/typographyV2'
import {taskStatusColors} from 'parabol-client/utils/taskStatus'
import * as React from 'react'
import {useFragment} from 'react-relay'
import {TaskStatusEnum} from '../../../../../__generated__/EmailTaskCard_task.graphql'
import {convertTipTapTaskContent} from '../../../../../shared/tiptap/convertTipTapTaskContent'
import {serverTipTapExtensions} from '../../../../../shared/tiptap/serverTipTapExtensions'

interface Props {
  task: EmailTaskCard_task$key | null
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
  content: convertTipTapTaskContent('<<TASK DELETED>>'),
  status: 'done',
  tags: [] as string[],
  user: {
    picture: null,
    preferredName: null
  }
} as const

const EmailTaskCard = (props: Props) => {
  const {task: taskRef, maxWidth} = props
  const task = useFragment(
    graphql`
      fragment EmailTaskCard_task on Task {
        content
        status
      }
    `,
    taskRef
  )
  const {content, status} = task || deletedTask
  const htmlContent = generateHTML(JSON.parse(content), serverTipTapExtensions)
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
                        <div dangerouslySetInnerHTML={{__html: htmlContent}}></div>
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

export default EmailTaskCard
