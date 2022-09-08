import styled from '@emotion/styled'
import {ThumbUp} from '@mui/icons-material'
import React from 'react'
import {useTranslation} from 'react-i18next'
import getRallyLink from '../modules/userDashboard/helpers/getRallyLink'
import {PALETTE} from '../styles/paletteV3'

const Wrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  paddingTop: 64
})

const ThumbsUp = styled(ThumbUp)({
  height: 48,
  width: 48,
  marginBottom: 16
})

const RallyLink = styled('span')({
  fontWeight: 600,
  color: PALETTE.SKY_500
})

const TimelineNoTasks = () => {
  const {t} = useTranslation()

  return (
    <Wrapper>
      <ThumbsUp />
      {t('TimelineNoTasks.YoureAllCaughtUp')}
      <RallyLink>{getRallyLink()}</RallyLink>
    </Wrapper>
  )
}

export default TimelineNoTasks
