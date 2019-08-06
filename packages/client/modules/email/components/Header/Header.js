import React from 'react'
import {emailTableBase} from '../../../../styles/email'
import emailDir from '../../emailDir'

const imageStyle = {
  border: '0px',
  display: 'block',
  margin: '0px'
}

const cellStyle = {
  padding: '32px 0px'
}

const Header = () => {
  return (
    <table style={emailTableBase} width='100%'>
      <tbody>
        <tr>
          <td align='left' style={cellStyle}>
            <img
              crossOrigin=''
              alt='Parabol, Inc. Logo'
              height={40}
              src={`${emailDir}email-header-branding-color@3x.png`}
              style={imageStyle}
              width={192}
            />
          </td>
        </tr>
      </tbody>
    </table>
  )
}

export default Header
