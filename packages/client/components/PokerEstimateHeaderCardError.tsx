import styled from '@emotion/styled'
import React from 'react'
import {useTranslation} from 'react-i18next'
import useBreakpoint from '../hooks/useBreakpoint'
import {Elevation} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import {Breakpoint} from '../types/constEnums'

const ErrorCard = styled('div')({
  alignItems: 'flex-start',
  background: PALETTE.WHITE,
  borderRadius: 4,
  boxShadow: Elevation.Z1,
  padding: '12px 8px 12px 16px',
  maxWidth: 1504, // matches widest dimension column 1600 - padding etc.
  margin: '0 auto',
  width: '100%'
})
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

interface Props {
  service?: string
}
const PokerEstimateHeaderCardError = (props: Props) => {
  const {service} = props

  const {t} = useTranslation()

  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  if (!service) {
    return (
      <HeaderCardWrapper isDesktop={isDesktop}>
        <ErrorCard>
          <CardTitleWrapper>
            <CardTitle>{t('PokerEstimateHeaderCardError.ThatStoryDoesntExist', {})}</CardTitle>
          </CardTitleWrapper>
          <CardDescription isExpanded={false}>
            {t(
              'PokerEstimateHeaderCardError.TheStoryWasDeletedYouCanAddAnotherStoryInTheScopePhase',
              {}
            )}
          </CardDescription>
        </ErrorCard>
      </HeaderCardWrapper>
    )
  }
  const serviceName = service.charAt(0).toUpperCase() + service.slice(1)
  return (
    <HeaderCardWrapper isDesktop={isDesktop}>
      <HeaderCard>
        <CardTitleWrapper>
          <CardTitle>
            {t('PokerEstimateHeaderCardError.ServiceNameIsDown', {
              serviceName
            })}
          </CardTitle>
        </CardTitleWrapper>
        <CardDescription isExpanded>
          {t(
            'PokerEstimateHeaderCardError.CannotConnectToServiceNameVotingWillBeDisabledIfTheProblemPersistsPleaseReAddTheIssueOrReIntegrate',
            {
              serviceName
            }
          )}
        </CardDescription>
      </HeaderCard>
    </HeaderCardWrapper>
  )
}

export default PokerEstimateHeaderCardError
