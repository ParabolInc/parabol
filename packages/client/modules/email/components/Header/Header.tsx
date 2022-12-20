import React from 'react'
import {ExternalLinks} from '../../../../types/constEnums'
import {CorsOptions} from '../../../../types/cors'
import makeAppURL from '../../../../utils/makeAppURL'
import {emailTableBase} from '../../styles'

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

interface Props {
  appOrigin: string
  corsOptions: CorsOptions
  align?: 'left' | 'center' | 'right'
}

const Header = (props: Props) => {
  const {appOrigin, corsOptions, align} = props
  const dashURL = makeAppURL(appOrigin, 'me')
  return (
    <table style={emailTableBase} width='100%'>
      <tbody>
        <tr>
          <td align={align ?? 'left'} style={cellStyle}>
            <a style={linkStyle} href={dashURL}>
              <img
                alt='Parabol, Inc. Logo'
                height={42}
                src={`${ExternalLinks.EMAIL_CDN}email-header-branding-color@3x.png`}
                style={imageStyle}
                width={204}
                {...corsOptions}
              />
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

export default Header
