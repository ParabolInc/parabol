import styled from '@emotion/styled'
import React from 'react'
import {useTranslation} from 'react-i18next'
import parabolMark from '../../../../styles/theme/images/brand/mark-color.svg'
import {ContactInfo} from '../../../../types/constEnums'

const Footer = styled('div')({
  textAlign: 'center'
})

const Heading = styled('div')({
  fontSize: 20,
  fontWeight: 600,
  lineHeight: '24px'
})

const Copy = styled('div')({
  fontSize: 14,
  lineHeight: '20px'
})

const Lockup = styled('img')({
  display: 'block',
  margin: '48px auto 16px',
  width: 64
})

const FinePrint = styled('div')({
  fontSize: 12,
  lineHeight: '1.5',
  margin: '16px auto 0'
})

const InvoiceFooter = () => {
  const {t} = useTranslation()

  return (
    <Footer>
      <Heading>{t('InvoiceFooter.ThankYouForUsingParabol')}</Heading>
      <Copy>
        {t('InvoiceFooter.QuestionsConcerns')}
        <br />
        {t('InvoiceFooter.GetInTouch')}
        <a href='mailto:billing@parabol.co' title={t('InvoiceFooter.ContactUs')}>
          <b>{ContactInfo.EMAIL_BILLING}</b>
        </a>
      </Copy>
      <Lockup crossOrigin='' alt={t('InvoiceFooter.LogoForParabol')} src={parabolMark} />
      <FinePrint>
        {t('InvoiceFooter.ParabolInc')}
        <br />
        {t('InvoiceFooter.2900WShorbSt')}
        <br />
        {t('InvoiceFooter.AlhambraCa91803')}
        <br />
        {t('InvoiceFooter.UnitedStates')}
        <br />
        <a
          href={t('InvoiceFooter.TelContactInfoTelephoneReplace', {
            contactInfoTelephoneReplace: ContactInfo.TELEPHONE.replace('-', '')
          })}
          title={t('InvoiceFooter.CallUsContactInfoTelephone', {
            contactInfoTelephone: ContactInfo.TELEPHONE
          })}
        >
          {ContactInfo.TELEPHONE}
        </a>
        <br />
        <a
          href={t('InvoiceFooter.MailtoContactInfoEmailLove', {
            contactInfoEmailLove: ContactInfo.EMAIL_LOVE
          })}
          title={t('InvoiceFooter.EmailUsContactInfoEmailLove', {
            contactInfoEmailLove: ContactInfo.EMAIL_LOVE
          })}
        >
          {ContactInfo.EMAIL_LOVE}
        </a>
      </FinePrint>
    </Footer>
  )
}

export default InvoiceFooter
