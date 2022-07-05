import styled from '@emotion/styled'
import React from 'react'
import IconOutlined from '../../../../components/IconOutlined'
import useBreakpoint from '../../../../hooks/useBreakpoint'
import {Breakpoint} from '../../../../types/constEnums'
import StyledButton from './StyledButton'

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
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)

  return (
    <Form method='get' target='_blank' action={contactUsUrl} onSubmit={onContactUsSubmit}>
      <StyledButton key='request' palette='warm'>
        {isDesktop ? 'Contact Us' : <IconOutlined>mail</IconOutlined>}
      </StyledButton>
    </Form>
  )
}

export default ContactUsButton
