import PropTypes from 'prop-types'
import React from 'react'
import ui from 'universal/styles/ui'

const Body = (props) => {
  const {align, children} = props

  const cellStyle = {
    color: ui.colorText,
    backgroundColor: ui.emailBodyColor,
    fontFamily: ui.emailFontFamily,
    fontSize: '16px',
    lineHeight: '1.5',
    padding: 0,
    textAlign: align
  }

  return (
    <table align={align} style={ui.emailTableBase} width='100%'>
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
