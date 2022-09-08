import React from 'react'
import {useTranslation} from 'react-i18next'
import {emailCopyStyle, emailTableBase, emailTextColorLight} from '../../styles'
import EmptySpace from '../EmptySpace/EmptySpace'

const copyStyle = {
  ...emailCopyStyle,
  color: emailTextColorLight,
  fontSize: '13px',
  lineHeight: '20px',
  margin: 0,
  textAlign: 'left'
} as const

const boldCopyStyle = {
  ...copyStyle,
  fontWeight: 600
} as const

const linkStyle = {
  ...copyStyle,
  textDecoration: 'underline'
} as const

const year = new Date().getFullYear()

const EmailFooter = () => {
  const {t} = useTranslation()

  return (
    <table align='left' width='100%' style={emailTableBase}>
      <tbody>
        <tr>
          <td>
            <EmptySpace height={24} />
            <div style={copyStyle}>
              {t('EmailFooter.YearParabolInc', {
                year
              })}
              <br />
              <span style={boldCopyStyle}>{t('EmailFooter.GetInTouch')}</span>
              {': '}
              <a
                href='mailto:love@parabol.co'
                title={t('EmailFooter.GetInTouch')}
                style={linkStyle}
              >
                {t('EmailFooter.LoveParabolCo')}
              </a>
            </div>
            <EmptySpace height={8} />
          </td>
        </tr>
      </tbody>
    </table>
  )
}

export default EmailFooter
