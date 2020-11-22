import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {PokerDimensionFinalScoreJiraPicker_stage} from '../__generated__/PokerDimensionFinalScoreJiraPicker_stage.graphql'
import JiraFieldDimensionDropdown from './JiraFieldDimensionDropdown'

const Wrapper = styled('div')({
  alignItems: 'center',
  display: 'flex',

})

const Label = styled('div')({
  display: 'flex'
})

interface Props {
  stage: PokerDimensionFinalScoreJiraPicker_stage
}

const PokerDimensionFinalScoreJiraPicker = (props: Props) => {
  const {stage} = props
  return (
    <Wrapper>
      <Label>{'Update Jira Issue: '}</Label>
      <JiraFieldDimensionDropdown stage={stage} />
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
