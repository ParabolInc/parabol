import React from 'react'
import TeamInvitationWrapper from './TeamInvitationWrapper'
import GenericAuthentication, {AuthPageSlug, GotoAuathPage} from './GenericAuthentication'
import useRouter from '../hooks/useRouter'
import getValidRedirectParam from '../utils/getValidRedirectParam'
import useAtmosphere from '../hooks/useAtmosphere'

interface Props {
  page: AuthPageSlug
}

const AuthenticationPage = (props: Props) => {
  const {history} = useRouter()
  const {page} = props
  const atmosphere = useAtmosphere()
  const {authObj} = atmosphere
  if (authObj) {
    const nextUrl = getValidRedirectParam() || '/me'
    // always replace otherwise they could get stuck in a back-button loop
    history.replace(nextUrl)
    return null
  }
  const gotoPage: GotoAuathPage = (page, search?) => {
    history.push(`/${page}${search}`)
  }
  return (
    <TeamInvitationWrapper>
      <GenericAuthentication page={page} gotoPage={gotoPage} />
    </TeamInvitationWrapper>
  )
}

export default AuthenticationPage
