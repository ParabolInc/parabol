import type {ServiceEnum} from '../../../__generated__/useGenerateInspirationItemsMutation.graphql'
import {
  getClientIntegration,
  isRegisteredClientIntegration
} from '../../../integrations/platform/registry'
import ParabolLogoSVG from '../../ParabolLogoSVG'

interface Props {
  service: ServiceEnum
}

const InspirationSourceLogo = ({service}: Props) => {
  if (service === 'PARABOL') return <ParabolLogoSVG />
  if (!isRegisteredClientIntegration(service)) return null
  const {Icon, iconClassName} = getClientIntegration(service)
  return <Icon className={iconClassName} />
}

export default InspirationSourceLogo
