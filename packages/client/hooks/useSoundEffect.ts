import {useEffect, useRef} from 'react'

type Props =
  | {
      startTime: Date | string
      endTime?: never
    }
  | {
      endTime: Date | string
      startTime?: never
    }

const safeDuration = (audio: HTMLAudioElement | null) => {
  const duration = audio?.duration
  if (duration && isFinite(duration)) return duration
  return 0
}

const useSoundEffect = (props: Props) => {
  // avoid playing when navigating to a page when the timer is already up.
  const hasPlayed = useRef(false)
  const soundRef = useRef<HTMLAudioElement>(null)

  const end =
    props.startTime !== undefined
      ? new Date(props.startTime).valueOf()
      : new Date(props.endTime).valueOf() - safeDuration(soundRef.current) * 1000
  const now = new Date().valueOf()
  const isTimeUp = end <= now

  useEffect(() => {
    hasPlayed.current = isTimeUp
  }, [])

  useEffect(() => {
    if (isTimeUp && !hasPlayed.current) {
      soundRef.current?.play().catch(() => {
        // ignore, can happen if the user did not interact with the page first
      })
      hasPlayed.current = true
    }
    if (!isTimeUp) {
      hasPlayed.current = false
      // stop playback if we just added time
      if (soundRef.current && !soundRef.current.paused) {
        soundRef.current.pause()
        soundRef.current.currentTime = 0
      }
    }
  }, [isTimeUp])
  return soundRef
}

export default useSoundEffect
