import React, {ReactNode} from 'react'
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

const Button = (props: {url: string; width?: number; children: ReactNode}) => {
  const {url, width = 240} = props
  return (
    <table style={{...emailTableBase, width}} width={width}>
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
