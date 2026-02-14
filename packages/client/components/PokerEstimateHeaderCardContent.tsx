import styled from '@emotion/styled'
import {Launch} from '@mui/icons-material'
import {useState} from 'react'
import type {PokerEstimateHeaderCard_stage$data} from '~/__generated__/PokerEstimateHeaderCard_stage.graphql'
import useBreakpoint from '~/hooks/useBreakpoint'
import {Elevation} from '~/styles/elevation'
import {PALETTE} from '~/styles/paletteV3'
import {Breakpoint} from '~/types/constEnums'
import CardButton from './CardButton'
import IconLabel from './IconLabel'
import {PokerEstimateHeaderCardMenu} from './PokerEstimateHeaderCardMenu'

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
  extraFields?:
    | Extract<
        NonNullable<PokerEstimateHeaderCard_stage$data['task']>['integration'],
        {__typename: 'JiraIssue'}
      >['extraFields']
    | null
    | undefined
  jiraDisplayFieldIds?: readonly string[] | null | undefined
  __typename: string
}

const PokerEstimateHeaderCardContent = (
  props: PokerEstimateHeaderCardContentProps & {settingsId: string}
) => {
  const {
    settingsId,
    cardTitle,
    descriptionHTML,
    url,
    linkTitle,
    linkText,
    onRefresh,
    isRefreshing,
    extraFields,
    jiraDisplayFieldIds,
    __typename
  } = props
  const [isExpanded, setIsExpanded] = useState(true)
  const toggleExpand = () => {
    setIsExpanded((isExpanded) => !isExpanded)
  }
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    }
  }
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
            {__typename === 'JiraIssue' && (
              <PokerEstimateHeaderCardMenu
                setIsExpanded={setIsExpanded}
                settingsId={settingsId}
                jiraDisplayFieldIds={jiraDisplayFieldIds}
                extraFields={extraFields}
              />
            )}
          </CardIcons>
        </CardTitleWrapper>
        <CardDescriptionWrapper isExpanded={isExpanded}>
          <CardDescriptionContent dangerouslySetInnerHTML={{__html: descriptionHTML}} />
          {jiraDisplayFieldIds?.map((fieldId) => {
            const extraField = extraFields?.find((field) => field.fieldId === fieldId)
            if (!extraField) return null
            const {fieldName, fieldType, fieldValue} = extraField
            return (
              <div key={fieldName}>
                <h4 className={'mt-3 mb-1'}>{fieldName}</h4>
                {fieldType === 'html' && (
                  <div dangerouslySetInnerHTML={{__html: fieldValue as string}} />
                )}
                {fieldType !== 'html' && <div>{fieldValue}</div>}
              </div>
            )
          })}
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
