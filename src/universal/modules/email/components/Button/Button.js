import PropTypes from 'prop-types'
import React from 'react'
import ui from 'universal/styles/ui'
import {emailPrimaryButtonStyle} from 'universal/styles/email'

const cellStyle = {
  color: '#FFFFFF',
  fontWeight: 600,
  padding: 0,
  textAlign: 'center'
}

const linkStyle = {
  ...emailPrimaryButtonStyle,
  width: '100%'
}

const Button = (props) => {
  const {url, width} = props
  return (
    <table style={ui.emailTableBase} width={`${width}px`}>
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

Button.defaultProps = {
  width: 240
}

Button.propTypes = {
  children: PropTypes.any,
  url: PropTypes.string,
  width: PropTypes.number
}

export default Button
