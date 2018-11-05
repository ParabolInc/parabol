import PropTypes from 'prop-types'
import React from 'react'
import EmptySpace from '../EmptySpace/EmptySpace'
import ui from 'universal/styles/ui'
import {emailCopyStyle} from 'universal/styles/email'

const copyStyle = {
  ...emailCopyStyle,
  color: ui.palette.midGray,
  fontSize: '13px',
  lineHeight: '20px',
  margin: 0,
  textAlign: 'left'
}

const boldCopyStyle = {
  ...copyStyle,
  fontWeight: 600
}

const linkStyle = {
  ...copyStyle,
  textDecoration: 'underline'
}

const year = new Date().getFullYear()

const EmailFooter = (props) => {
  const {maxWidth} = props
  const innerDiv = {
    margin: '0 auto',
    maxWidth: `${maxWidth || 600}px`,
    width: '100%'
  }
  return (
    <table align='left' width='100%' style={ui.emailTableBase}>
      <tbody>
        <tr>
          <td style={{padding: '0 24px'}}>
            <EmptySpace height={24} />
            <div style={innerDiv}>
              <div style={copyStyle}>
                {`©${year} Parabol, Inc.`}
                <br />
                <span style={boldCopyStyle}>{'Get in touch'}</span>
                {': '}
                <a href='mailto:love@parabol.co' title='Get in touch' style={linkStyle}>
                  love@parabol.co
                </a>
              </div>
            </div>
            <EmptySpace height={8} />
          </td>
        </tr>
      </tbody>
    </table>
  )
}

EmailFooter.propTypes = {
  maxWidth: PropTypes.number
}

export default EmailFooter
