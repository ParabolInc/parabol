import styled from '@emotion/styled'
import {Info as InfoIcon} from '@mui/icons-material'
import React, {useState} from 'react'
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

const features = [
  {
    id: 'suggestGroups',
    name: 'Suggest Groups',
    tooltip:
      'Get AI-powered suggestions for creating new groups based on team activity and collaboration patterns'
  },
  {
    id: 'publicTeams',
    name: 'Public Teams',
    tooltip: 'Allow teams to be discoverable by anyone in your organization'
  },
  {
    id: 'standupAISummary',
    name: 'Stand-Up AI Summary',
    tooltip: 'Automatically generate summaries of your team standups using AI'
  },
  {
    id: 'relatedDiscussions',
    name: 'Related Discussions',
    tooltip: 'See AI-suggested related discussions and threads across your organization'
  }
]

const OrgFeatureFlags = () => {
  const [featureStates, setFeatureStates] = useState<Record<string, boolean>>({
    suggestGroups: false,
    publicTeams: false,
    standupAISummary: false,
    relatedDiscussions: false
  })

  const handleToggle = (featureId: string) => {
    setFeatureStates((prev) => ({
      ...prev,
      [featureId]: !prev[featureId]
    }))
  }

  return (
    <StyledPanel isWide label='Organization Feature Flags'>
      <PanelRow>
        {features.map((feature) => (
          <FeatureRow key={feature.id}>
            <FeatureNameGroup>
              <span>{feature.name}</span>
              <Tooltip>
                <TooltipTrigger className='bg-transparent hover:cursor-pointer'>
                  <InfoIcon className='h-4 w-4 text-slate-600' />
                </TooltipTrigger>
                <TooltipContent>{feature.tooltip}</TooltipContent>
              </Tooltip>
            </FeatureNameGroup>
            <Toggle active={featureStates[feature.id]!} onClick={() => handleToggle(feature.id)} />
          </FeatureRow>
        ))}
      </PanelRow>
    </StyledPanel>
  )
}

export default OrgFeatureFlags
