import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {PALETTE} from '../styles/paletteV2'
import {PokerDimensionFinalScoreJiraPicker_stage} from '../__generated__/PokerDimensionFinalScoreJiraPicker_stage.graphql'
import JiraFieldDimensionDropdown from './JiraFieldDimensionDropdown'
import LinkButton from './LinkButton'
import StyledError from './StyledError'

const Wrapper = styled('div')({
  alignItems: 'center',
  display: 'flex',
  userSelect: 'none',
  width: '100%'
})

const Mapper = styled('div')({
  display: 'flex',
  flex: 1,
  justifyContent: 'flex-end'
})

const Label = styled('div')({
  display: 'flex',
  fontSize: 14,
  paddingLeft: 8,
  paddingRight: 8,
  fontWeight: 600
})

const ErrorMessage = styled(StyledError)({
  fontSize: 14
})

const StyledLinkButton = styled(LinkButton)<{canUpdate: boolean}>(({canUpdate}) => ({
  color: PALETTE.LINK_BLUE,
  fontSize: 14,
  fontWeight: 600,
  height: 40,
  paddingLeft: 16,
  ':hover,:focus,:active': {
    boxShadow: 'none',
    color: PALETTE.LINK_BLUE_HOVER
  },
  visibility: canUpdate ? undefined : 'hidden'
}))

interface Props {
  canUpdate: boolean
  clearError: () => void
  isFacilitator: boolean
  stage: PokerDimensionFinalScoreJiraPicker_stage
  error?: string
  submitScore: () => void
}

const PokerDimensionFinalScoreJiraPicker = (props: Props) => {
  const {isFacilitator, canUpdate, error, stage, clearError, submitScore} = props
  return (
    <Wrapper>
      {isFacilitator && <StyledLinkButton canUpdate={canUpdate} onClick={submitScore}>{'Update'}</StyledLinkButton>}
      <Mapper>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Label>{'Jira Issue Field: '}</Label>
        <JiraFieldDimensionDropdown clearError={clearError} stage={stage} isFacilitator={isFacilitator} />
      </Mapper>
    </Wrapper>
  )
}

export default createFragmentContainer(
  PokerDimensionFinalScoreJiraPicker,
  {
    stage: graphql`
    fragment PokerDimensionFinalScoreJiraPicker_stage on EstimateStage {
      ...JiraFieldDimensionDropdown_stage
    }
    `
  }
)
