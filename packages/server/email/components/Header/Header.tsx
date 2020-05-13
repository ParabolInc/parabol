import React from 'react'
import emailDir from '../../emailDir'
import {emailTableBase} from '../../styles'
import makeAppLink from '../../../utils/makeAppLink'

const imageStyle = {
  border: '0px',
  display: 'block',
  margin: '0px'
}

const cellStyle = {
  padding: '32px 0px'
}

const linkStyle = {
  display: 'block',
  textDecoration: 'none'
}

const dashUrl = makeAppLink('me')

const Header = () => {
  return (
    <table style={emailTableBase} width='100%'>
      <tbody>
        <tr>
          <td align='left' style={cellStyle}>
            <a style={linkStyle} href={dashUrl}>
              <img
                crossOrigin=''
                alt='Parabol, Inc. Logo'
                height={40}
                src={`${emailDir}email-header-branding-color@3x.png`}
                style={imageStyle}
                width={192}
              />
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

export default Header
