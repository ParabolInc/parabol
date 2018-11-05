import PropTypes from 'prop-types'
import React from 'react'
import ui from 'universal/styles/ui'

const containerStyle = {
  ...ui.emailTableBase,
  WebkitTextSizeAdjust: '100%',
  msTextSizeAdjust: '100%',
  msoTableLspace: '0pt',
  msoTableRspace: '0pt',
  backgroundColor: ui.emailBackgroundColor,
  textAlign: 'center'
}

const innerStyle = {
  ...ui.emailTableBase,
  WebkitTextSizeAdjust: '100%',
  msTextSizeAdjust: '100%',
  msoTableLspace: '0pt',
  msoTableRspace: '0pt',
  fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif',
  textAlign: 'center'
}

const cellStyle = {
  padding: '16px',
  textAlign: 'center'
}

const containerDiv = {
  margin: '0 auto',
  width: '100%'
}

// const responsiveEmailTest = {
//   color: 'blue'
// }

// <div className='responsiveEmailTest' style={responsiveEmailTest}>Test</div>

const Layout = (props) => {
  const {children, maxWidth} = props
  return (
    <table align='center' className='body' style={containerStyle} width='100%'>
      <tbody>
        <tr>
          <td align='center' style={cellStyle}>
            <div style={{...containerDiv, maxWidth: `${maxWidth || 600}px`}}>
              <table align='center' className='container' style={innerStyle} width='100%'>
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

Layout.propTypes = {
  children: PropTypes.any,
  maxWidth: PropTypes.number
}

export default Layout
