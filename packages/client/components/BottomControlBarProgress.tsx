import styled from '@emotion/styled'
import React, {useEffect, useState} from 'react'
import {PALETTE} from '~/styles/paletteV2'
import {BezierCurve} from '~/types/constEnums'
import requestDoubleAnimationFrame from './RetroReflectPhase/requestDoubleAnimationFrame'

const RADIUS = 12
const THICKNESS = 2
const DIAMETER = RADIUS * 2
const RADIUS_NORMALIZED = RADIUS - THICKNESS
const CIRCUMFERENCE = 2 * Math.PI * RADIUS_NORMALIZED

const SVG = styled('svg')({
  height: DIAMETER,
  width: DIAMETER,
  position: 'absolute',
  transform: `translateY(-6px)`
})

const Circle = styled('circle')<{isConfirming: boolean; isInitConfirm: boolean}>(
  ({isConfirming, isInitConfirm}) => ({
    fill: 'transparent',
    stroke: isConfirming ? PALETTE.EMPHASIS_WARM : PALETTE.TEXT_BLUE,
    strokeDasharray: CIRCUMFERENCE.toFixed(3),
    strokeWidth: THICKNESS,
    transform: 'rotate(-90deg)',
    transformOrigin: '50% 50%',
    transition: `stroke-dashoffset ${isConfirming ? (isInitConfirm ? 0 : 3000) : 300}ms ${
      BezierCurve.DECELERATE
    }`
  })
)

interface Props {
  isConfirming: boolean
  progress: number
}

const BottomControlBarProgress = (props: Props) => {
  const {isConfirming, progress} = props
  const [isInitConfirm, setIsInitConfirm] = useState(false)
  const finalProgress = isConfirming ? (isInitConfirm ? 1 : 0) : progress
  useEffect(() => {
    if (isConfirming) {
      setIsInitConfirm(true)
      requestDoubleAnimationFrame(() => {
        setIsInitConfirm(false)
      })
    }
  }, [isConfirming])

  return (
    <SVG>
      <Circle
        isConfirming={isConfirming}
        isInitConfirm={isInitConfirm}
        style={{
          strokeDashoffset: CIRCUMFERENCE - finalProgress * CIRCUMFERENCE
        }}
        strokeWidth={THICKNESS}
        r={RADIUS_NORMALIZED}
        cx={RADIUS}
        cy={RADIUS}
      />
    </SVG>
  )
}

export default BottomControlBarProgress
