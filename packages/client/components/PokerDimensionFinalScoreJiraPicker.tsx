import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {RefObject} from 'react'
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
  textAlign: 'left',
  fontSize: 14
})

const StyledLinkButton = styled(LinkButton)({
  color: PALETTE.LINK_BLUE,
  fontSize: 14,
  fontWeight: 600,
  height: 40,
  padding: '0 16px',
  ':hover,:focus,:active': {
    boxShadow: 'none',
    color: PALETTE.LINK_BLUE_HOVER
  }
})

interface Props {
  canUpdate: boolean
  clearError: () => void
  isFacilitator: boolean
  stage: PokerDimensionFinalScoreJiraPicker_stage
  error?: string | null
  submitScore: () => void
  inputRef: RefObject<HTMLInputElement>
}

const PokerDimensionFinalScoreJiraPicker = (props: Props) => {
  const {inputRef, isFacilitator, canUpdate, error, stage, clearError, submitScore} = props
  const focusInput = () => inputRef.current!.focus()
  return (
    <Wrapper>
      {isFacilitator
        ? canUpdate
          ? <StyledLinkButton onClick={submitScore}>{'Update'}</StyledLinkButton>
          : <StyledLinkButton onClick={focusInput}>{'Edit Score'}</StyledLinkButton>
        : null
      }
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
