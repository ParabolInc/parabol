import {useCallback, useEffect, useRef, useState} from 'react'

export interface Track {
  name: string
  src: string
}

export const availableTracks: Track[] = [
  {name: 'Lo-fi Hip Hop Night', src: '/static/sounds/lofi-hip-hop-night.mp3'},
  {name: 'Lo-fi Coffee', src: '/static/sounds/coffee-lofi.mp3'},
  {name: 'Lo-fi Quiet', src: '/static/sounds/quiet-lofi.mp3'},
  {name: 'Lo-fi Tokyo', src: '/static/sounds/tokyo-lofi.mp3'},
  {name: 'Lo-fi Ambient', src: '/static/sounds/lofi-ambient.mp3'}
]

type Props = {
  isFacilitator: boolean
  initialTrackUrl?: string | null
  initialIsPlaying?: boolean
  initialVolume?: number
}
type BackgroundMusicControls = {
  playTrack: (trackSrc: string) => void
  pause: () => void
  stop: () => void
  setVolume: (newVolume: number) => void
  selectTrack: (trackSrc: string) => void
  currentTrackSrc: string | null
  isPlaying: boolean
  volume: number
  availableTracks: Track[]
}

const useBackgroundMusicManager = (props: Props): BackgroundMusicControls => {
  const {initialTrackUrl = null, initialIsPlaying = false, initialVolume = 0.5} = props

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentTrackSrc, setCurrentTrackSrc] = useState<string | null>(initialTrackUrl)
  const [isPlaying, setIsPlaying] = useState<boolean>(initialIsPlaying)
  const [volume, setVolumeState] = useState<number>(initialVolume)
  const [pausedAt, setPausedAt] = useState<number | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.volume = volume
      audioRef.current.setAttribute('playsinline', 'true')
    }
    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    if (!audioRef.current) return

    if (currentTrackSrc) {
      if (audioRef.current.src !== currentTrackSrc) {
        audioRef.current.src = currentTrackSrc
        if (pausedAt !== null) {
          audioRef.current.currentTime = pausedAt
        }
      }
      if (isPlaying) {
        if (pausedAt !== null) {
          audioRef.current.currentTime = pausedAt
        }
        const playPromise = audioRef.current.play()
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.error('Error playing audio:', err)
          })
        }
      } else {
        audioRef.current.pause()
      }
    } else {
      audioRef.current.pause()
    }
  }, [currentTrackSrc, isPlaying])

  const playTrack = useCallback(
    (trackSrc: string) => {
      setCurrentTrackSrc(trackSrc)
      setIsPlaying(true)
      if (pausedAt !== null) setPausedAt(pausedAt)
    },
    [pausedAt]
  )

  const pause = useCallback(() => {
    if (audioRef.current) {
      setPausedAt(audioRef.current.currentTime)
    }
    setIsPlaying(false)
  }, [])

  const stop = useCallback(() => {
    setCurrentTrackSrc(null)
    setIsPlaying(false)
    setPausedAt(null)
  }, [])

  const setVolume = useCallback((newVolume: number) => {
    const clamped = Math.max(0, Math.min(1, newVolume))
    setVolumeState(clamped)
  }, [])

  const selectTrack = useCallback((trackSrc: string) => {
    setCurrentTrackSrc(trackSrc)
    setIsPlaying(false)
    setPausedAt(null)
  }, [])

  return {
    playTrack,
    pause,
    stop,
    setVolume,
    selectTrack,
    currentTrackSrc,
    isPlaying,
    volume,
    availableTracks
  }
}

export default useBackgroundMusicManager
