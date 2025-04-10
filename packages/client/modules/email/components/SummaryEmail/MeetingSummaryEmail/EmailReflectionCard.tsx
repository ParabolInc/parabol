import {generateHTML} from '@tiptap/html'
import graphql from 'babel-plugin-relay/macro'
import {EmailReflectionCard_reflection$key} from 'parabol-client/__generated__/EmailReflectionCard_reflection.graphql'
import {PALETTE} from 'parabol-client/styles/paletteV3'
import {FONT_FAMILY} from 'parabol-client/styles/typographyV2'
import * as React from 'react'
import {useFragment} from 'react-relay'
import {serverTipTapExtensions} from '../../../../../shared/tiptap/serverTipTapExtensions'

interface Props {
  reflection: EmailReflectionCard_reflection$key
}

const contentStyle = {
  backgroundColor: '#FFFFFF',
  borderColor: PALETTE.SLATE_400,
  borderRadius: '4px',
  borderStyle: 'solid',
  borderWidth: '1px',
  boxSizing: 'content-box',
  breakInside: 'avoid',
  color: PALETTE.SLATE_700,
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
  maxWidth: 188,
  wordBreak: 'break-word'
} as React.CSSProperties

const reflectionCardFooter = {
  color: PALETTE.SLATE_600,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: 11,
  paddingLeft: 4
}

const EmailReflectionCard = (props: Props) => {
  const {reflection: reflectionRef} = props
  const reflection = useFragment(
    graphql`
      fragment EmailReflectionCard_reflection on RetroReflection {
        content
        prompt {
          question
        }
      }
    `,
    reflectionRef
  )
  const {content, prompt} = reflection
  const {question} = prompt
  const htmlContent = generateHTML(JSON.parse(content), serverTipTapExtensions)
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
                        <div dangerouslySetInnerHTML={{__html: htmlContent}}></div>
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

export default EmailReflectionCard
