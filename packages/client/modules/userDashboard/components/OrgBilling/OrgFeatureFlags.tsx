import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {Info as InfoIcon} from '~/ui/icons'
import type {OrgFeatureFlags_organization$key} from '../../../../__generated__/OrgFeatureFlags_organization.graphql'
import Panel from '../../../../components/Panel/Panel'
import Toggle from '../../../../components/Toggle/Toggle'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import ToggleFeatureFlagMutation from '../../../../mutations/ToggleFeatureFlagMutation'
import {Tooltip} from '../../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../../ui/Tooltip/TooltipTrigger'

const FEATURE_NAME_LOOKUP: Record<string, string> = {}

interface Props {
  organizationRef: OrgFeatureFlags_organization$key
}

const OrgFeatureFlags = (props: Props) => {
  const {organizationRef} = props
  const atmosphere = useAtmosphere()
  const {onError, onCompleted, error} = useMutationProps()
  const organization = useFragment(
    graphql`
      fragment OrgFeatureFlags_organization on Organization {
        id
        isOrgAdmin
        orgFeatureFlags {
          featureName
          description
          enabled
        }
      }
    `,
    organizationRef
  )
  const {isOrgAdmin} = organization

  const handleToggle = async (featureName: string) => {
    const variables = {
      featureName,
      orgId: organization.id
    }
    ToggleFeatureFlagMutation(atmosphere, variables, {
      onError,
      onCompleted
    })
  }

  if (!isOrgAdmin || organization.orgFeatureFlags.length === 0) return null
  return (
    <Panel className='max-w-[976px]' label='Organization Feature Flags'>
      <div className='border-hairline border-t p-4'>
        {organization.orgFeatureFlags.map((feature) => (
          <div key={feature.featureName} className='mb-2 flex items-center justify-between'>
            <div className='flex items-center gap-1 [&_svg]:block'>
              <span>{FEATURE_NAME_LOOKUP[feature.featureName] || feature.featureName}</span>
              <Tooltip>
                <TooltipTrigger className='bg-transparent hover:cursor-pointer'>
                  <InfoIcon className='h-4 w-4 text-fg-secondary' />
                </TooltipTrigger>
                <TooltipContent>{feature.description}</TooltipContent>
              </Tooltip>
            </div>
            <Toggle active={!!feature.enabled} onClick={() => handleToggle(feature.featureName)} />
          </div>
        ))}
        {error && (
          <div className='mt-2 pr-4 font-semibold text-fg-error text-xs'>{error.message}</div>
        )}
      </div>
    </Panel>
  )
}

export default OrgFeatureFlags
