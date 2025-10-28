import type * as React from 'react'
import type {ReactNode} from 'react'
import {emailPrimaryButtonStyle, emailTableBase} from '../styles'

const cellStyle = {
  color: '#FFFFFF',
  fontWeight: 600,
  padding: 0,
  textAlign: 'center'
} as React.CSSProperties

const linkStyle = {
  ...emailPrimaryButtonStyle,
  width: '100%'
} as React.CSSProperties

const Button = (props: {
  url: string
  width?: number
  children: ReactNode
  style?: React.CSSProperties
}) => {
  const {url, width = 240, style = {}} = props
  return (
    <table style={{...emailTableBase, width, ...style}} width={width}>
      <tbody>
        <tr>
          <td align='center' style={cellStyle}>
            <a href={url} style={linkStyle}>
              {props.children}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

export default Button
