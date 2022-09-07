import styled from '@emotion/styled'
import React from 'react'
import {useTranslation} from 'react-i18next'
import useCanonical from '~/hooks/useCanonical'
import useAtmosphere from '../hooks/useAtmosphere'
import useDocumentTitle from '../hooks/useDocumentTitle'
import useRouter from '../hooks/useRouter'
import getValidRedirectParam from '../utils/getValidRedirectParam'
import GenericAuthentication, {AuthPageSlug, GotoAuthPage} from './GenericAuthentication'
import TeamInvitationWrapper from './TeamInvitationWrapper'

const CopyBlock = styled('div')({
  marginBottom: 48,
  width: 'calc(100vw - 16px)',
  maxWidth: 500,
  textAlign: 'center'
})

interface Props {
  page: AuthPageSlug
}

const AuthenticationPage = (props: Props) => {
  //FIXME i18n: Sign Up for Free Online Retrospectives | Parabol
  //FIXME i18n: Sign Up
  const {t} = useTranslation()

  const {history} = useRouter()
  const {page} = props
  const atmosphere = useAtmosphere()
  const {authObj} = atmosphere
  useDocumentTitle('Sign Up for Free Online Retrospectives | Parabol', 'Sign Up')
  useCanonical(page)
  if (authObj) {
    const nextUrl = getValidRedirectParam() || '/meetings'
    // always replace otherwise they could get stuck in a back-button loop
    setTimeout(() => history.replace(nextUrl))
    return null
  }
  const goToPage: GotoAuthPage = (page, search?) => {
    const url = search ? `/${page}${search}` : `/${page}`
    history.push(url)
  }
  return (
    <TeamInvitationWrapper>
      <CopyBlock>
        <h1>
          {t('AuthenticationPage.BetterMeetings')}
          <br />
          {t('AuthenticationPage.LessEffort')}
        </h1>
        <p>
          {t('AuthenticationPage.92OfUsersAgreedThatParabolImprovesTheEfficiencyOfTheirMeetings')}
        </p>
      </CopyBlock>
      <GenericAuthentication page={page} goToPage={goToPage} />
    </TeamInvitationWrapper>
  )
}

export default AuthenticationPage
