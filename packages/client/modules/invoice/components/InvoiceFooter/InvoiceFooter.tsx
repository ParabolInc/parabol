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
  //FIXME i18n: Contact Us
  //FIXME i18n: Logo for Parabol
  const {t} = useTranslation()

  return (
    <Footer>
      <Heading>{t('InvoiceFooter.ThankYouForUsingParabol')}</Heading>
      <Copy>
        {t('InvoiceFooter.QuestionsConcerns')}
        <br />
        {t('InvoiceFooter.GetInTouch')}
        <a href='mailto:billing@parabol.co' title='Contact Us'>
          <b>{ContactInfo.EMAIL_BILLING}</b>
        </a>
      </Copy>
      <Lockup crossOrigin='' alt='Logo for Parabol' src={parabolMark} />
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
          href={`tel:${ContactInfo.TELEPHONE.replace('-', '')}`}
          title={`Call us: ${ContactInfo.TELEPHONE}`}
        >
          {ContactInfo.TELEPHONE}
        </a>
        <br />
        <a href={`mailto:${ContactInfo.EMAIL_LOVE}`} title={`Email us: ${ContactInfo.EMAIL_LOVE}`}>
          {ContactInfo.EMAIL_LOVE}
        </a>
      </FinePrint>
    </Footer>
  )
}

export default InvoiceFooter
