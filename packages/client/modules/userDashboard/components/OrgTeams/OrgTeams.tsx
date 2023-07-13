import React from 'react'
import styled from '@emotion/styled'
import Row from '../../../../components/Row/Row'
import RowInfo from '../../../../components/Row/RowInfo'
import RowInfoHeader from '../../../../components/Row/RowInfoHeader'
import Panel from '../../../../components/Panel/Panel'
import {ElementWidth} from '../../../../types/constEnums'

const StyledPanel = styled(Panel)({
  maxWidth: ElementWidth.PANEL_WIDTH
})

const OrgTeams = () => {
  return (
    <StyledPanel label='6 Teams'>
      <Row>
        <RowInfo>
          <RowInfoHeader>Team Name</RowInfoHeader>
        </RowInfo>
      </Row>
    </StyledPanel>
  )
}

export default OrgTeams
