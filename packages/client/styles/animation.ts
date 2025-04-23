// Timing function to decelerate
import {keyframes} from '@emotion/react'

export const DECELERATE = 'cubic-bezier(0, 0, .2, 1)'

// Timing function to quickly accelerate and slowly decelerate
export const STANDARD_CURVE = 'cubic-bezier(.4, 0, .2, 1)'

// Timing function to accelerate
export const ACCELERATE = 'cubic-bezier(.4, 0, 1, 1)'

// Timing function to quickly accelerate and decelerate
export const SHARP_CURVE = 'cubic-bezier(.4, 0, .6, 1)'

export const fadeIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0);
  }
	100% {
	  opacity: 1;
	  transform: scale(1);
	}
`

export const fadeUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(8px);
  }
	100% {
	  opacity: 1;
	  transform: translateY(0);
	}
`
