import {Info as InfoIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {OrgFeatures_organization$key} from '../../../../__generated__/OrgFeatures_organization.graphql'
import Panel from '../../../../components/Panel/Panel'
import Toggle from '../../../../components/Toggle/Toggle'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import ToggleAIFeaturesMutation from '../../../../mutations/ToggleAIFeaturesMutation'
import {Tooltip} from '../../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../../ui/Tooltip/TooltipTrigger'

interface Props {
  organizationRef: OrgFeatures_organization$key
}

const OrgFeatures = (props: Props) => {
  const {organizationRef} = props
  const atmosphere = useAtmosphere()
  const {onError, onCompleted} = useMutationProps()
  const organization = useFragment(
    graphql`
      fragment OrgFeatures_organization on Organization {
        id
        isOrgAdmin
        useAI
      }
    `,
    organizationRef
  )
  const {id: orgId, isOrgAdmin, useAI} = organization

  const handleToggle = () => {
    const variables = {orgId}
    ToggleAIFeaturesMutation(atmosphere, variables, {
      onError,
      onCompleted
    })
  }

  if (!isOrgAdmin) return null
  return (
    <Panel className='max-w-[976px]' label='AI Features'>
      <div className='border-hairline border-t p-4'>
        <div className='mb-2 flex items-center justify-between'>
          <div className='flex items-center gap-1 [&_svg]:block'>
            <span>Enable AI Features</span>
            <Tooltip>
              <TooltipTrigger className='bg-transparent hover:cursor-pointer'>
                <InfoIcon className='h-4 w-4 text-fg-secondary' />
              </TooltipTrigger>
              <TooltipContent>Enable AI-powered features across your organization</TooltipContent>
            </Tooltip>
          </div>
          <Toggle active={useAI} onClick={handleToggle} />
        </div>
      </div>
    </Panel>
  )
}

export default OrgFeatures
