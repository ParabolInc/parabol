import styled from '@emotion/styled'
import React, {useState} from 'react'
import Panel from '../../../../components/Panel/Panel'
import Toggle from '../../../../components/Toggle/Toggle'
import {PALETTE} from '../../../../styles/paletteV3'
import {ElementWidth, Layout} from '../../../../types/constEnums'

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

const OrgFeatures = () => {
  const [showAIFeatures, setShowAIFeatures] = useState(false)

  return (
    <StyledPanel isWide label='AI Features'>
      <PanelRow>
        <FeatureRow>
          <span>Show AI Features</span>
          <Toggle active={showAIFeatures} onClick={() => setShowAIFeatures(!showAIFeatures)} />
        </FeatureRow>
      </PanelRow>
    </StyledPanel>
  )
}

export default OrgFeatures
