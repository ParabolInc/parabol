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

const OrgFeatures = () => {
  const [showAIFeatures, setShowAIFeatures] = useState(false)

  return (
    <StyledPanel isWide label='AI Features'>
      <PanelRow>
        <FeatureRow>
          <FeatureNameGroup>
            <span>Show AI Features</span>
            <Tooltip>
              <TooltipTrigger className='bg-transparent hover:cursor-pointer'>
                <InfoIcon className='h-4 w-4 text-slate-600' />
              </TooltipTrigger>
              <TooltipContent>Enable AI-powered features across your organization</TooltipContent>
            </Tooltip>
          </FeatureNameGroup>
          <Toggle active={showAIFeatures} onClick={() => setShowAIFeatures(!showAIFeatures)} />
        </FeatureRow>
      </PanelRow>
    </StyledPanel>
  )
}

export default OrgFeatures
