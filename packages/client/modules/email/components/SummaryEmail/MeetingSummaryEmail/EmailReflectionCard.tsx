import {convertFromRaw, Editor, EditorState} from 'draft-js'
import React, {useMemo, useRef} from 'react'
import {PALETTE} from '../../../../../styles/paletteV2'
import {FONT_FAMILY} from '../../../../../styles/typographyV2'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import editorDecorators from '../../../../../components/TaskEditor/decorators'
import {EmailReflectionCard_reflection} from '../../../../../__generated__/EmailReflectionCard_reflection.graphql'

interface Props {
  reflection: EmailReflectionCard_reflection
}

const contentStyle = {
  backgroundColor: '#FFFFFF',
  borderColor: PALETTE.BORDER_LIGHT,
  borderRadius: '4px',
  borderStyle: 'solid',
  borderWidth: '1px',
  boxSizing: 'content-box',
  color: PALETTE.TEXT_MAIN,
  fontFamily: FONT_FAMILY.SANS_SERIF,
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
  color: PALETTE.TEXT_GRAY,
  fontFamily: FONT_FAMILY.SANS_SERIF,
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

export default createFragmentContainer(EmailReflectionCard, {
  reflection: graphql`
    fragment EmailReflectionCard_reflection on RetroReflection {
      content
      phaseItem {
        question
      }
    }
  `
})
