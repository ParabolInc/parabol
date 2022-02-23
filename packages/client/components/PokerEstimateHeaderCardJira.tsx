import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import useBreakpoint from '~/hooks/useBreakpoint'
import {Elevation} from '~/styles/elevation'
import {PALETTE} from '~/styles/paletteV3'
import {Breakpoint} from '~/types/constEnums'
import {ICON_SIZE} from '../styles/typographyV2'
import {PokerEstimateHeaderCardJira_issue} from '../__generated__/PokerEstimateHeaderCardJira_issue.graphql'
import CardButton from './CardButton'
import Icon from './Icon'
import IconLabel from './IconLabel'
const HeaderCardWrapper = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  display: 'flex',
  padding: isDesktop ? '0px 16px 4px' : '0px 8px 4px'
}))

const HeaderCard = styled('div')({
  background: PALETTE.WHITE,
  borderRadius: 4,
  boxShadow: Elevation.Z1,
  height: '100%',
  padding: '12px 16px',
  maxWidth: 1504, // matches widest dimension column 1600 - padding etc.
  margin: '0 auto',
  width: '100%'
})

const CardTitle = styled('h1')({
  fontSize: 16,
  lineHeight: '24px',
  margin: '0 0 8px'
})

const CardIcons = styled('div')({
  display: 'flex'
})

const CardTitleWrapper = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  width: '100%'
})

const CardDescription = styled('div')<{isExpanded: boolean}>(({isExpanded}) => ({
  color: PALETTE.SLATE_700,
  fontWeight: 'normal',
  lineHeight: '20px',
  fontSize: 14,
  margin: 0,
  maxHeight: isExpanded ? 300 : 30,
  overflowY: isExpanded ? 'auto' : 'hidden',
  transition: 'all 300ms'
}))

const StyledIcon = styled(Icon)({
  fontSize: ICON_SIZE.MD18,
  paddingLeft: 4
})

const StyledLink = styled('a')({
  color: PALETTE.SKY_500,
  display: 'flex',
  fontSize: 12,
  lineHeight: '20px',
  marginTop: '10px',
  textDecoration: 'none'
})

const StyledLabel = styled('span')({
  fontSize: 12
})

interface Props {
  issue: PokerEstimateHeaderCardJira_issue
}
const PokerEstimateHeaderCardJira = (props: Props) => {
  const {issue} = props
  const [isExpanded, setIsExpanded] = useState(true)
  const toggleExpand = () => {
    setIsExpanded((isExpanded) => !isExpanded)
  }
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const {issueKey, summary, descriptionHTML, jiraUrl} = issue
  return (
    <HeaderCardWrapper isDesktop={isDesktop}>
      <HeaderCard>
        <CardTitleWrapper>
          <CardTitle>{summary}</CardTitle>
          <CardIcons>
            <CardButton>
              <IconLabel icon='unfold_more' onClick={toggleExpand} />
            </CardButton>
          </CardIcons>
        </CardTitleWrapper>
        <CardDescription
          isExpanded={isExpanded}
          dangerouslySetInnerHTML={{__html: descriptionHTML}}
        />
        <StyledLink
          href={jiraUrl}
          rel='noopener noreferrer'
          target='_blank'
          title={`Jira Issue #${issueKey}`}
        >
          <StyledLabel>{issueKey}</StyledLabel>
          <StyledIcon>launch</StyledIcon>
        </StyledLink>
      </HeaderCard>
    </HeaderCardWrapper>
  )
}

export default createFragmentContainer(PokerEstimateHeaderCardJira, {
  issue: graphql`
    fragment PokerEstimateHeaderCardJira_issue on JiraIssue {
      issueKey
      summary
      descriptionHTML
      jiraUrl: url
    }
  `
})
