import {useNavigate} from 'react-router'
import useCanonical from '~/hooks/useCanonical'
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
  useCanonical(page)
  if (authObj) {
    const nextUrl = getValidRedirectParam() || '/meetings'
    // always replace otherwise they could get stuck in a back-button loop
    setTimeout(() => navigate(nextUrl, {replace: true}))
    return null
  }
  const goToPage: GotoAuthPage = (page, search?) => {
    const url = search ? `/${page}${search}` : `/${page}`
    navigate(url)
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
