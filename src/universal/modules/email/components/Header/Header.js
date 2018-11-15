import PropTypes from 'prop-types'
import React from 'react'
import {emailTableBase} from 'universal/styles/email'

const imageStyle = {
  border: '0px',
  display: 'block',
  margin: '0px'
}

const cellStyle = {
  padding: '32px 0px'
}

const logoName = 'email-header-branding-color'

const Header = (props) => {
  const {imgProvider} = props

  const provider =
    imgProvider === 'hubspot'
      ? 'https://email.parabol.co/hubfs/app-emails/'
      : '/static/images/email/email-header-branding/'

  const imageSrc = `${provider}${logoName}@3x.png`

  return (
    <table style={emailTableBase} width='100%'>
      <tbody>
        <tr>
          <td align='left' style={cellStyle}>
            <img
              alt='Parabol, Inc. Logo'
              height={40}
              src={imageSrc}
              style={imageStyle}
              width={192}
            />
          </td>
        </tr>
      </tbody>
    </table>
  )
}

Header.propTypes = {
  imgProvider: PropTypes.oneOf(['app', 'hubspot'])
}

Header.defaultProps = {
  imgProvider: 'app'
}

export default Header
