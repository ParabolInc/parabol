/**
 * Wraps content with the authentication page scaffolding (e.g. header).
 *
 */
import React, {ReactNode} from 'react'
import styled from 'react-emotion'
import Helmet from 'react-helmet'
import ui from 'universal/styles/ui'
import appTheme from 'universal/styles/theme/appTheme'
import Header from './Header'

type Props = {
  children: ReactNode
  title: string
}

const PageContainer = styled('div')({
  alignItems: 'center',
  backgroundColor: ui.backgroundColor,
  color: appTheme.palette.dark,
  display: 'flex',
  flexDirection: 'column',
  // TODO: need to double check this, not always desired effect (TA)
  // height: '100vh'
  maxWidth: '100%',
  minHeight: '100vh'
})

const CenteredBlock = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  height: '100%',
  maxWidth: '100%',
  padding: '0 1rem 2rem',
  width: '30rem'
})

export default ({children, title}: Props) => (
  <PageContainer>
    <Helmet title={title} />
    <Header />
    <CenteredBlock>{children}</CenteredBlock>
  </PageContainer>
)
