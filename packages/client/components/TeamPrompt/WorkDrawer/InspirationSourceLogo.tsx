import gcalLogo from '../../../styles/theme/images/graphics/google-calendar.svg'
import GitHubSVG from '../../GitHubSVG'
import JiraSVG from '../../JiraSVG'
import LinearSVG from '../../LinearSVG'
import ParabolLogoSVG from '../../ParabolLogoSVG'

interface Props {
  service: string
}

const InspirationSourceLogo = ({service}: Props) => {
  switch (service) {
    case 'PARABOL':
      return <ParabolLogoSVG />
    case 'github':
      return <GitHubSVG className='dark:[&_path]:fill-white' />
    case 'jira':
      return <JiraSVG />
    case 'linear':
      return <LinearSVG className='dark:[&_path]:fill-white' />
    case 'gcal':
      return <img className='h-6 w-6' src={gcalLogo} alt='' />
    default:
      return null
  }
}

export default InspirationSourceLogo
