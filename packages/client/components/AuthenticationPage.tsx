import {useNavigate} from '@tanstack/react-router'
import {useRef} from 'react'
import useCanonical from '~/hooks/useCanonical'
import hrefOptions from '~/routing/hrefOptions'
import Redirect from '~/routing/Redirect'
import useAtmosphere from '../hooks/useAtmosphere'
import getValidRedirectParam from '../utils/getValidRedirectParam'
import GenericAuthentication, {type AuthPageSlug, type GotoAuthPage} from './GenericAuthentication'
import TeamInvitationWrapper from './TeamInvitationWrapper'

interface Props {
  page: AuthPageSlug
}

const AuthenticationPage = (props: Props) => {
  const navigate = useNavigate()
  const {page} = props
  const {authObj} = useAtmosphere()
  // if they sign in here, the login mutation redirects them, so following the auth cookie would navigate twice
  const isInitiallySignedInRef = useRef(!!authObj)
  useCanonical(page)
  if (isInitiallySignedInRef.current) {
    const nextUrl = getValidRedirectParam() || '/meetings'
    // always replace otherwise they could get stuck in a back-button loop
    return <Redirect {...hrefOptions(nextUrl)} replace />
  }
  const goToPage: GotoAuthPage = (page, search?) => {
    const url = search ? `/${page}${search}` : `/${page}`
    navigate({href: url})
  }
  return (
    <TeamInvitationWrapper>
      <div className='mb-12 w-[calc(100vw-16px)] max-w-[356px] text-center'>
        <h1>
          Better Meetings, <br />
          Less Effort
        </h1>
        <p>92&#37; of users agreed that Parabol improves the efficiency of their meetings.</p>
      </div>
      <GenericAuthentication page={page} goToPage={goToPage} />
    </TeamInvitationWrapper>
  )
}
export default AuthenticationPage
