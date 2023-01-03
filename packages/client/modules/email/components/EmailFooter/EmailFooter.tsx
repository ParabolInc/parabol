import React from 'react'
import {ContactInfo} from '../../../../types/constEnums'
import {emailCopyStyle, emailTableBase, emailTextColor} from '../../styles'
import EmptySpace from '../EmptySpace/EmptySpace'

const copyStyle = {
  ...emailCopyStyle,
  color: emailTextColor,
  fontSize: '13px',
  lineHeight: '20px',
  margin: 0,
  textAlign: 'left'
} as const

const linkStyle = {
  ...copyStyle,
  textDecoration: 'underline'
} as const

const year = new Date().getFullYear()

const finePrintStyle = {
  fontSize: 12,
  lineHeight: '1.5',
  margin: '16px auto 0'
}

const EmailFooter = () => {
  return (
    <table align='left' width='100%' style={emailTableBase}>
      <tbody>
        <tr>
          <td>
            <EmptySpace height={8} />
            <div style={finePrintStyle}>
              {'Parabol, Inc.'}
              <br />
              {'8605 Santa Monica Blvd'}
              <br />
              {'West Hollywood, CA 90069-4109'}
              <br />
              {'United States'}
              <br />
              <a
                href={`tel:${ContactInfo.TELEPHONE.replace('-', '')}`}
                title={`Call us: ${ContactInfo.TELEPHONE}`}
                style={linkStyle}
              >
                {ContactInfo.TELEPHONE}
              </a>
              <br />
              {`©${year} Parabol, Inc.`}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

export default EmailFooter
