import styled from '@emotion/styled'
import {Launch} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {PokerEstimateHeaderCardContent_task$key} from '~/__generated__/PokerEstimateHeaderCardContent_task.graphql'
import useBreakpoint from '~/hooks/useBreakpoint'
import {Elevation} from '~/styles/elevation'
import {PALETTE} from '~/styles/paletteV3'
import {Breakpoint} from '~/types/constEnums'
import CardButton from './CardButton'
import IconLabel from './IconLabel'
import {JiraExtraFieldsContent} from './JiraExtraFieldsContent'
import {TaskJiraFieldsContent} from './TaskJiraFieldsContent'
import {TaskMoreOptionsMenu} from './TaskMoreOptionsMenu'

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

const CardDescriptionWrapper = styled('div')<{isExpanded: boolean}>(({isExpanded}) => ({
  color: PALETTE.SLATE_700,
  fontWeight: 'normal',
  lineHeight: '20px',
  fontSize: 14,
  margin: 0,
  maxHeight: isExpanded ? 300 : 30,
  overflowY: isExpanded ? 'auto' : 'hidden',
  transition: 'all 300ms'
}))

const CardDescriptionContent = styled('div')`
  a {
    text-decoration: underline;
    :hover,
    :focus {
      color: ${PALETTE.SLATE_700};
    }
  }
`

const StyledIcon = styled(Launch)({
  height: 18,
  width: 18,
  marginLeft: 4
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

export type PokerEstimateHeaderCardContentProps = {
  cardTitle: string
  descriptionHTML: string
  url: string
  linkTitle: string
  linkText: string
  onRefresh?: () => void
  isRefreshing?: boolean
  taskRef: PokerEstimateHeaderCardContent_task$key
}

const PokerEstimateHeaderCardContent = (props: PokerEstimateHeaderCardContentProps) => {
  const {cardTitle, descriptionHTML, url, linkTitle, linkText, onRefresh, isRefreshing, taskRef} =
    props
  const [isExpanded, setIsExpanded] = useState(true)
  const toggleExpand = () => {
    setIsExpanded((isExpanded) => !isExpanded)
  }
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    }
  }
  const task = useFragment(
    graphql` fragment PokerEstimateHeaderCardContent_task on Task {
    ...TaskJiraFieldsContent_task
    team {
      jiraDisplayFieldIds
    }
    integration {
      __typename
      ... on JiraIssue {
        ...JiraExtraFieldsContent_issue
      }
    }
  }`,
    taskRef
  )
  const {team, integration} = task
  const {jiraDisplayFieldIds} = team
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  return (
    <HeaderCardWrapper isDesktop={isDesktop}>
      <HeaderCard>
        <CardTitleWrapper>
          <CardTitle>{cardTitle}</CardTitle>
          <CardIcons>
            <CardButton>
              <IconLabel
                icon='refresh'
                onClick={isRefreshing ? undefined : handleRefresh}
                tooltip='Refresh contents'
              />
            </CardButton>
            <CardButton>
              {isExpanded ? (
                <IconLabel icon='unfold_less' onClick={toggleExpand} tooltip='Collapse contents' />
              ) : (
                <IconLabel icon='unfold_more' onClick={toggleExpand} tooltip='Expand contents' />
              )}
            </CardButton>
            {integration?.__typename === 'JiraIssue' && (
              <TaskMoreOptionsMenu
                jiraFieldsContent={
                  <TaskJiraFieldsContent
                    taskRef={task}
                    onAddJiraField={() => setIsExpanded(true)}
                  />
                }
              />
            )}
          </CardIcons>
        </CardTitleWrapper>
        <CardDescriptionWrapper isExpanded={isExpanded}>
          <CardDescriptionContent dangerouslySetInnerHTML={{__html: descriptionHTML}} />
          {integration?.__typename === 'JiraIssue' && (
            <JiraExtraFieldsContent
              jiraDisplayFieldIds={jiraDisplayFieldIds!}
              issueRef={integration}
            />
          )}
        </CardDescriptionWrapper>
        <StyledLink href={url} rel='noopener noreferrer' target='_blank' title={linkTitle}>
          <StyledLabel>{linkText}</StyledLabel>
          <StyledIcon />
        </StyledLink>
      </HeaderCard>
    </HeaderCardWrapper>
  )
}

export default PokerEstimateHeaderCardContent
