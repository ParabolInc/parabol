import React, {ReactNode} from 'react'
import {emailBackgroundColor, emailMaxWidth, emailTableBase} from '../../styles'

const containerStyle = {
  ...emailTableBase,
  WebkitTextSizeAdjust: '100%',
  msTextSizeAdjust: '100%',
  msoTableLspace: '0pt',
  msoTableRspace: '0pt',
  backgroundColor: emailBackgroundColor,
  textAlign: 'center'
} as const

const innerStyle = {
  ...emailTableBase,
  WebkitTextSizeAdjust: '100%',
  msTextSizeAdjust: '100%',
  msoTableLspace: '0pt',
  msoTableRspace: '0pt',
  fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif',
  textAlign: 'center'
} as const

const cellStyle = {
  padding: '16px 8px',
  textAlign: 'center'
} as const

const maxWidthContainer = {
  margin: '0 auto',
  width: '100%'
}

interface Props {
  children: ReactNode
  maxWidth?: number
}

const Layout = (props: Props) => {
  const {children, maxWidth = emailMaxWidth} = props
  return (
    <table align='center' className='body' style={containerStyle} width='100%'>
      <tbody>
        <tr>
          <td align='center' style={cellStyle}>
            <div style={{...maxWidthContainer, maxWidth}}>
              <table align='center' className='maxWidthContainer' style={innerStyle} width='100%'>
                <tbody>
                  <tr>
                    <td>{children}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

export default Layout
