import styled from '@emotion/styled'
import React from 'react'
import DialogTitle from '../../../../components/DialogTitle'

const Inner = styled('div')({
  padding: '24px 16px 28px 28px'
})

const Title = styled(DialogTitle)({
  padding: '0 0 8px 0'
})

const OrgAuthenticationHeader = () => {
  return (
    <Inner>
      <Title>SAML Single Sign-On</Title>
    </Inner>
  )
}

export default OrgAuthenticationHeader
