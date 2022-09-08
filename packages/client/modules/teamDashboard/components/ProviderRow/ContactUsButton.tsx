import styled from '@emotion/styled'
import {MailOutlined} from '@mui/icons-material'
import React from 'react'
import {useTranslation} from 'react-i18next'
import useBreakpoint from '../../../../hooks/useBreakpoint'
import {Breakpoint} from '../../../../types/constEnums'
import ProviderRowActionButton from './ProviderRowActionButton'

const Form = styled('form')({
  display: 'flex',
  flex: 1
})

interface Props {
  contactUsUrl: string
  onContactUsSubmit: () => void
}

const ContactUsButton = (props: Props) => {
  const {contactUsUrl, onContactUsSubmit} = props

  const {t} = useTranslation()

  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)

  return (
    <Form method='get' target='_blank' action={contactUsUrl} onSubmit={onContactUsSubmit}>
      <ProviderRowActionButton key='request' palette='warm'>
        {isDesktop ? t('ContactUsButton.ContactUs') : <MailOutlined />}
      </ProviderRowActionButton>
    </Form>
  )
}

export default ContactUsButton
