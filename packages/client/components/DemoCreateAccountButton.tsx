import styled from '@emotion/styled'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import useBreakpoint from '../hooks/useBreakpoint'
import {meetingAvatarMediaQueries} from '../styles/meeting'
import GiftSVG from './GiftSVG'
import LinkButton from './LinkButton'

const StyledButton = styled(LinkButton)({
  fontSize: 13,
  fontWeight: 600,
  height: 32,
  marginRight: 16,
  [meetingAvatarMediaQueries[0]]: {
    fontSize: 15
  },
  [meetingAvatarMediaQueries[1]]: {
    fontSize: 16
  }
})

const Label = styled('div')({
  marginLeft: 8
})

const DemoCreateAccountButton = (props: RouteComponentProps) => {
  const {history} = props

  const {t} = useTranslation()

  const handleClick = () => history.push('/create-account?from=demo')
  const isBreakpoint = useBreakpoint(480)
  return (
    <StyledButton palette='blue' onClick={handleClick}>
      <GiftSVG />
      {isBreakpoint && <Label>{t('DemoCreateAccountButton.CreateFreeAccount')}</Label>}
    </StyledButton>
  )
}

export default withRouter(DemoCreateAccountButton)
