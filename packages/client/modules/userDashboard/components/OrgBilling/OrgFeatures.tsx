import styled from '@emotion/styled'
import {Info as InfoIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {OrgFeatures_organization$key} from '../../../../__generated__/OrgFeatures_organization.graphql'
import Panel from '../../../../components/Panel/Panel'
import Toggle from '../../../../components/Toggle/Toggle'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import ToggleAIFeaturesMutation from '../../../../mutations/ToggleAIFeaturesMutation'
import {PALETTE} from '../../../../styles/paletteV3'
import {ElementWidth, Layout} from '../../../../types/constEnums'
import {Tooltip} from '../../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../../ui/Tooltip/TooltipTrigger'

const StyledPanel = styled(Panel)<{isWide: boolean}>(({isWide}) => ({
  maxWidth: isWide ? ElementWidth.PANEL_WIDTH : 'inherit'
}))

const PanelRow = styled('div')({
  borderTop: `1px solid ${PALETTE.SLATE_300}`,
  padding: Layout.ROW_GUTTER
})

const FeatureRow = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8
})

const FeatureNameGroup = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  '& svg': {
    display: 'block'
  }
})

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
    <StyledPanel isWide label='AI Features'>
      <PanelRow>
        <FeatureRow>
          <FeatureNameGroup>
            <span>Enable AI Features</span>
            <Tooltip>
              <TooltipTrigger className='bg-transparent hover:cursor-pointer'>
                <InfoIcon className='h-4 w-4 text-slate-600' />
              </TooltipTrigger>
              <TooltipContent>Enable AI-powered features across your organization</TooltipContent>
            </Tooltip>
          </FeatureNameGroup>
          <Toggle active={useAI} onClick={handleToggle} />
        </FeatureRow>
      </PanelRow>
    </StyledPanel>
  )
}

export default OrgFeatures
