import PropTypes from 'prop-types'
import React from 'react'
import ui from 'universal/styles/ui'

const Header = (props) => {
  const {imgProvider, maxWidth} = props

  const tableStyle = {
    ...ui.emailTableBase
  }

  const imageStyle = {
    border: 0,
    display: 'block',
    margin: 0
  }

  const emailHeaderStyle = {
    ...ui.emailTableBase,
    backgroundColor: '#FFFFFF',
    color: ui.palette.dark,
    padding: '32px 24px',
    textAlign: 'left'
  }

  const logo = 'email-header-branding-color'
  const provider =
    imgProvider === 'hubspot'
      ? 'https://email.parabol.co/hubfs/app-emails/'
      : '/static/images/email/email-header-branding/'
  const imageSrc = `${provider}${logo}@3x.png`

  const innerDiv = {
    margin: '0 auto',
    maxWidth: `${maxWidth || 600}px`,
    width: '100%'
  }

  return (
    <table style={tableStyle} width='100%'>
      <tbody>
        <tr>
          <td align='center' style={emailHeaderStyle}>
            <div style={innerDiv}>
              <img
                alt='Parabol, Inc. Logo'
                height={40}
                src={imageSrc}
                style={imageStyle}
                width={192}
              />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

Header.propTypes = {
  imgProvider: PropTypes.oneOf(['app', 'hubspot']),
  maxWidth: PropTypes.number
}

Header.defaultProps = {
  imgProvider: 'app'
}

export default Header
