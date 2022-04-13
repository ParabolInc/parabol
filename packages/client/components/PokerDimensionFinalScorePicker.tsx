import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {RefObject} from 'react'
import {useFragment} from 'react-relay'
import useBreakpoint from '~/hooks/useBreakpoint'
import {Breakpoint} from '~/types/constEnums'
import {PALETTE} from '../styles/paletteV3'
import {PokerDimensionFinalScorePicker_stage$key} from '../__generated__/PokerDimensionFinalScorePicker_stage.graphql'
import GitHubFieldDimensionDropdown from './GitHubFieldDimensionDropdown'
import GitLabFieldDimensionDropdown from './GitLabFieldDimensionDropdown'
import JiraFieldDimensionDropdown from './JiraFieldDimensionDropdown'
import LinkButton from './LinkButton'
import StyledError from './StyledError'

const Wrapper = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  userSelect: 'none',
  width: '100%'
})

const Mapper = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  alignItems: isDesktop ? undefined : 'flex-end',
  display: 'flex',
  flex: 1,
  flexDirection: isDesktop ? undefined : 'column-reverse',
  justifyContent: 'flex-end'
}))

const Label = styled('div')({
  display: 'flex',
  fontSize: 14,
  paddingLeft: 8,
  paddingRight: 8,
  fontWeight: 600
})

const ErrorMessage = styled(StyledError)<{isDesktop: boolean}>(({isDesktop}) => ({
  fontSize: isDesktop ? 14 : 12,
  fontWeight: isDesktop ? 600 : 400,
  textAlign: isDesktop ? 'left' : 'right',
  padding: isDesktop ? '0 0 0 8px' : '8px 0 0'
}))

const StyledLinkButton = styled(LinkButton)({
  color: PALETTE.SKY_500,
  fontSize: 14,
  fontWeight: 600,
  height: 40,
  marginLeft: 8,
  padding: '0 8px',
  ':hover,:focus,:active': {
    boxShadow: 'none',
    color: PALETTE.SKY_600
  }
})

const ControlWrapper = styled('div')({
  alignItems: 'center',
  display: 'flex'
})

const MobileLabel = styled(Label)({
  padding: '0 4px 0 0'
})

interface Props {
  canUpdate: boolean
  clearError: () => void
  isFacilitator: boolean
  stageRef: PokerDimensionFinalScorePicker_stage$key
  error?: string | null
  submitScore: () => void
  inputRef: RefObject<HTMLInputElement>
}

const PokerDimensionFinalScorePicker = (props: Props) => {
  const {inputRef, isFacilitator, canUpdate, error, stageRef, clearError, submitScore} = props
  const stage = useFragment(
    graphql`
      fragment PokerDimensionFinalScorePicker_stage on EstimateStage {
        ...GitHubFieldDimensionDropdown_stage
        ...JiraFieldDimensionDropdown_stage
        ...GitLabFieldDimensionDropdown_stage
        task {
          integration {
            __typename
          }
        }
      }
    `,
    stageRef
  )

  const integrationType = stage.task?.integration?.__typename ?? ''

  const titleByType = {
    _xGitHubIssue: 'GitHub',
    JiraIssue: 'Jira',
    JiraServerIssue: 'Jira Server',
    _xGitLabIssue: 'GitLab'
  }
  const title = titleByType[integrationType]
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const focusInput = () => inputRef.current!.focus()
  return (
    <Wrapper>
      {isFacilitator ? (
        canUpdate ? (
          <StyledLinkButton onClick={submitScore}>{'Update'}</StyledLinkButton>
        ) : (
          <StyledLinkButton onClick={focusInput}>{'Edit Score'}</StyledLinkButton>
        )
      ) : null}
      <Mapper isDesktop={isDesktop}>
        {error && <ErrorMessage isDesktop={isDesktop}>{error}</ErrorMessage>}
        <ControlWrapper>
          {isDesktop ? <Label>{`${title} Label: `}</Label> : <MobileLabel>{'Label:'}</MobileLabel>}

          {integrationType === '_xGitHubIssue' && (
            <GitHubFieldDimensionDropdown
              clearError={clearError}
              stageRef={stage}
              isFacilitator={isFacilitator}
              submitScore={submitScore}
            />
          )}
          {(integrationType === 'JiraIssue' || integrationType === 'JiraServerIssue') && (
            <JiraFieldDimensionDropdown
              clearError={clearError}
              stageRef={stage}
              isFacilitator={isFacilitator}
              submitScore={submitScore}
            />
          )}
          {integrationType === '_xGitLabIssue' && (
            <GitLabFieldDimensionDropdown
              clearError={clearError}
              stageRef={stage}
              isFacilitator={isFacilitator}
              submitScore={submitScore}
            />
          )}
        </ControlWrapper>
      </Mapper>
    </Wrapper>
  )
}

export default PokerDimensionFinalScorePicker
