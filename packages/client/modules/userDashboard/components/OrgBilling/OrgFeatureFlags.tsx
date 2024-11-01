import styled from '@emotion/styled'
import {Info as InfoIcon} from '@mui/icons-material'
import React from 'react'
import {graphql, useFragment} from 'react-relay'
import {OrgFeatureFlags_organization$key} from '../../../../__generated__/OrgFeatureFlags_organization.graphql'
import Panel from '../../../../components/Panel/Panel'
import Toggle from '../../../../components/Toggle/Toggle'
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
  gap: 4
})

interface Props {
  organizationRef: OrgFeatureFlags_organization$key
}

const OrgFeatureFlags = ({organizationRef}: Props) => {
  const organization = useFragment(
    graphql`
      fragment OrgFeatureFlags_organization on Organization {
        id
        orgFeatureFlags {
          featureName
          description
          enabled
        }
      }
    `,
    organizationRef
  )

  const handleToggle = async (featureName: string) => {}

  return (
    <StyledPanel isWide label='Organization Feature Flags'>
      <PanelRow>
        {organization.orgFeatureFlags.map((feature) => (
          <FeatureRow key={feature.featureName}>
            <FeatureNameGroup>
              <span>{feature.featureName}</span>
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
