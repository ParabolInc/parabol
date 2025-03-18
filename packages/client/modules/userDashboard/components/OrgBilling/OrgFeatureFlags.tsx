import styled from '@emotion/styled'
import {Info as InfoIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {OrgFeatureFlags_organization$key} from '../../../../__generated__/OrgFeatureFlags_organization.graphql'
import Panel from '../../../../components/Panel/Panel'
import Toggle from '../../../../components/Toggle/Toggle'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import ToggleFeatureFlagMutation from '../../../../mutations/ToggleFeatureFlagMutation'
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

const FEATURE_NAME_LOOKUP: Record<string, string> = {
  insights: 'Insights'
}

interface Props {
  organizationRef: OrgFeatureFlags_organization$key
}

const OrgFeatureFlags = (props: Props) => {
  const {organizationRef} = props
  const atmosphere = useAtmosphere()
  const {onError, onCompleted} = useMutationProps()
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
    <StyledPanel isWide label='Organization Feature Flags'>
      <PanelRow>
        {organization.orgFeatureFlags.map((feature) => (
          <FeatureRow key={feature.featureName}>
            <FeatureNameGroup>
              <span>{FEATURE_NAME_LOOKUP[feature.featureName] || feature.featureName}</span>
              <Tooltip>
                <TooltipTrigger className='bg-transparent hover:cursor-pointer'>
                  <InfoIcon className='h-4 w-4 text-slate-600' />
                </TooltipTrigger>
                <TooltipContent>{feature.description}</TooltipContent>
              </Tooltip>
            </FeatureNameGroup>
            <Toggle active={!!feature.enabled} onClick={() => handleToggle(feature.featureName)} />
          </FeatureRow>
        ))}
      </PanelRow>
    </StyledPanel>
  )
}

export default OrgFeatureFlags
