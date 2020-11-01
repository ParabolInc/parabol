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

const HeaderCardWrapper = styled('div')({
  display: 'flex',
  padding: '4px 24px'
})

const HeaderCard = styled('div')({
  background: PALETTE.CONTROL_LIGHT,
  borderRadius: '4px',
  boxShadow: Elevation.Z3,
  padding: '12px 16px',
  maxWidth: 1000,
  width: '55%'
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
  const {issue} = stage
  const {key, summary, descriptionHTML, url} = issue!
  const [isExpanded, setIsExpanded] = useState(false)
  const descriptionRef = useRef<HTMLDivElement>(null)
  const maxHeight = descriptionRef.current?.scrollHeight ?? 1000
  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }
  return (
    <HeaderCardWrapper>
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
    fragment PokerEstimateHeaderCardJira_stage on EstimateStageJira {
      issue {
        key
        summary
        descriptionHTML
        url
      }
    }`
  }
)
