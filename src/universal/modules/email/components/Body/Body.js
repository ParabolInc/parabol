import PropTypes from 'prop-types'
import React from 'react'
import {
  emailBodyColor,
  emailFontFamily,
  emailFontSize,
  emailLineHeight,
  emailTableBase,
  emailTextColor
} from 'universal/styles/email'

const Body = (props) => {
  const {align, children} = props

  const cellStyle = {
    color: emailTextColor,
    backgroundColor: emailBodyColor,
    fontFamily: emailFontFamily,
    fontSize: emailFontSize,
    lineHeight: emailLineHeight,
    padding: 0,
    textAlign: align
  }

  return (
    <table align={align} style={emailTableBase} width="100%">
      <tbody>
        <tr>
          <td align={align} style={cellStyle}>
            {children}
          </td>
        </tr>
      </tbody>
    </table>
  )
}

Body.propTypes = {
  align: PropTypes.oneOf(['center', 'left']),
  children: PropTypes.any
}

Body.defaultProps = {
  align: 'center'
}

export default Body
