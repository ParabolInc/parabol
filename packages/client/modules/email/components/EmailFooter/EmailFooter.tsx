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
              {'1111 6th Ave., Ste 550'}
              <br />
              {'PMB 73201'}
              <br />
              {'San Diego, CA 92101'}
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
