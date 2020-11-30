import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from '../styles/paletteV2'
import {BezierCurve} from '../types/constEnums'

const EstimateMeta = styled('div')({
  fontWeight: 600,
  paddingRight: 8,
})

const EmptyProgressBar = styled('div')({
  background: PALETTE.BACKGROUND_GRAY,
  borderRadius: 10,
  height: 4
})

const FilledProgressBar = styled(EmptyProgressBar)<{percent: number}>(({percent}) => ({
  position: 'absolute',
  background: PALETTE.BACKGROUND_GREEN,
  width: 24 * percent,
  top: 0,
  transition: `width 300ms ${BezierCurve.DECELERATE}`
}))

const ProgressBar = styled('div')({
  marginRight: 8,
  position: 'relative',
  width: 24
})
interface Props {
  finalScores: (string | null)[]
}

const PokerSidebarEstimateMeta = (props: Props) => {
  const {finalScores} = props
  if (finalScores.length === 1) {
    const [firstScore] = finalScores
    const label = firstScore || '–'
    return (
      <EstimateMeta>
        {label}
      </EstimateMeta>
    )
  }
  const completedScoreCount = finalScores.filter(Boolean).length
  return (
    <ProgressBar>
      <EmptyProgressBar />
      <FilledProgressBar percent={completedScoreCount / finalScores.length} />
    </ProgressBar>

  )
}

export default PokerSidebarEstimateMeta
