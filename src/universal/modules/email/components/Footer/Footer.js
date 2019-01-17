import PropTypes from 'prop-types'
import React from 'react'
import EmptySpace from '../EmptySpace/EmptySpace'
import {emailBodyColor, emailFontFamily, emailTableBase} from 'universal/styles/email'

const Footer = (props) => {
  const tableStyle = {
    ...emailTableBase,
    backgroundColor: emailBodyColor,
    color: props.color
  }

  const spaceStyle = {
    lineHeight: '1px',
    fontSize: '1px'
  }

  const cellStyles = {
    backgroundColor: emailBodyColor,
    color: props.color,
    fontFamily: emailFontFamily,
    fontSize: 13,
    textAlign: 'center'
  }

  return (
    <table width='100%' style={tableStyle}>
      <tbody>
        <tr>
          <td>
            <EmptySpace height={48} />
          </td>
          <td>
            <EmptySpace height={48} />
          </td>
          <td>
            <EmptySpace height={48} />
          </td>
        </tr>

        <tr>
          <td height='1' width='20' style={spaceStyle}>
            &nbsp;
          </td>

          <td>
            <table width='560'>
              <tbody>
                <tr>
                  <td style={cellStyles}>
                    <EmptySpace height={10} />
                    <img src='/static/images/brand/mark-color@3x.png' height='28' width='31' />
                    <EmptySpace height={10} />
                    Crafted with care by the folks at Parabol
                    <EmptySpace height={10} />
                  </td>
                </tr>
              </tbody>
            </table>
          </td>

          <td height='1' width='20' style={spaceStyle}>
            &nbsp;
          </td>
        </tr>

        <tr>
          <td>
            <EmptySpace height={48} />
          </td>
          <td>
            <EmptySpace height={48} />
          </td>
          <td>
            <EmptySpace height={48} />
          </td>
        </tr>
      </tbody>
    </table>
  )
}

Footer.propTypes = {
  color: PropTypes.string.isRequired
}

export default Footer
