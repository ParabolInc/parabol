import type {ServiceEnum} from '../../../__generated__/useGenerateInspirationItemsMutation.graphql'
import {getClientIntegration} from '../../../integrations/platform/registry'
import ParabolLogoSVG from '../../ParabolLogoSVG'

interface Props {
  service: ServiceEnum
}

const InspirationSourceLogo = ({service}: Props) => {
  if (service === 'PARABOL') return <ParabolLogoSVG />
  const definition = getClientIntegration(service)
  if (!definition) return null
  return <definition.Icon className={definition.iconClassName} />
}

export default InspirationSourceLogo
