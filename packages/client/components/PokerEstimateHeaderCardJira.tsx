import React, {useRef, useState} from 'react'
import styled from '@emotion/styled'
import {Elevation} from '~/styles/elevation'
import {PALETTE} from '~/styles/paletteV2'
import CardButton from './CardButton'
import IconLabel from './IconLabel'
import Icon from './Icon'
import {ICON_SIZE} from '../styles/typographyV2'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {PokerEstimateHeaderCardJira_stage} from '../__generated__/PokerEstimateHeaderCardJira_stage.graphql'
import {IJiraIssue} from '../types/graphql'
import useBreakpoint from '~/hooks/useBreakpoint'
import {Breakpoint} from '~/types/constEnums'

const HeaderCardWrapper = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  display: 'flex',
  padding: isDesktop ? '0px 16px 4px' : '0px 8px 4px'
}))

const HeaderCard = styled('div')({
  background: PALETTE.CONTROL_LIGHT,
  borderRadius: 4,
  boxShadow: Elevation.Z1,
  padding: '12px 16px',
  maxWidth: 1504, // matches widest dimension column 1600 - padding etc.
  margin: '0 auto',
  width: '100%'
})

const CardTitle = styled('h1')({
  fontSize: 16,
  lineHeight: '24px',
  margin: 0
})

const CardIcons = styled('div')({
  display: 'flex'
})

const CardTitleWrapper = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%'
})

const CardDescription = styled('div')<{isExpanded: boolean, maxHeight: number}>(({isExpanded, maxHeight}) => ({
  color: PALETTE.TEXT_MAIN,
  fontWeight: 'normal',
  lineHeight: '20px',
  fontSize: 14,
  margin: 0,
  maxHeight: isExpanded ? maxHeight : 30,
  overflow: 'hidden',
  transition: 'all 300ms'
}))

const StyledIcon = styled(Icon)({
  fontSize: ICON_SIZE.MD18,
  paddingLeft: 4
})

const StyledLink = styled('a')({
  color: PALETTE.LINK_BLUE,
  display: 'flex',
  fontSize: 12,
  lineHeight: '20px',
  textDecoration: 'none'
})

const StyledLabel = styled('span')({
  fontSize: 12
})



interface Props {
  stage: PokerEstimateHeaderCardJira_stage
}
const PokerEstimateHeaderCardJira = (props: Props) => {
  const {stage} = props
  const {story} = stage
  const {key, summary, descriptionHTML, url} = story as IJiraIssue
  const [isExpanded, setIsExpanded] = useState(false)
  const descriptionRef = useRef<HTMLDivElement>(null)
  const maxHeight = descriptionRef.current?.scrollHeight ?? 1000
  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
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
        <CardDescription ref={descriptionRef} maxHeight={maxHeight} isExpanded={isExpanded} dangerouslySetInnerHTML={{__html: descriptionHTML}} />
        <StyledLink
          href={url}
          rel='noopener noreferrer'
          target='_blank'
          title={`Jira Issue #${key}`}
        >
          <StyledLabel>{key}</StyledLabel>
          <StyledIcon>launch</StyledIcon>
        </StyledLink>
      </HeaderCard>
    </HeaderCardWrapper>
  )
}

export default createFragmentContainer(
  PokerEstimateHeaderCardJira,
  {
    stage: graphql`
    fragment PokerEstimateHeaderCardJira_stage on EstimateStage {
      story {
        ...on JiraIssue {
          key
          summary
          descriptionHTML
          url
        }
      }
    }`
  }
)
