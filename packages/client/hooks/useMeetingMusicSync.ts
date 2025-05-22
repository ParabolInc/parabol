import graphql from 'babel-plugin-relay/macro'
import {useCallback, useEffect, useRef, useState} from 'react'
import {useLazyLoadQuery} from 'react-relay'
import {useMeetingMusicSyncQuery} from '../__generated__/useMeetingMusicSyncQuery.graphql'
import SetMeetingMusicMutation from '../mutations/SetMeetingMusicMutation'
import useAtmosphere from './useAtmosphere'

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

interface MeetingMusicSyncProps {
  meetingId: string
}

const query = graphql`
  query useMeetingMusicSyncQuery($meetingId: ID!) {
    viewer {
      meeting(meetingId: $meetingId) {
        id
        facilitatorUserId
        musicSettings {
          trackSrc
          isPlaying
          volume
        }
      }
    }
  }
`

const useMeetingMusicSync = (props: MeetingMusicSyncProps) => {
  const {meetingId} = props
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const data = useLazyLoadQuery<useMeetingMusicSyncQuery>(query, {meetingId: meetingId || ''})
  const meeting = data.viewer?.meeting
  console.log('🚀 ~ meeting:', meeting)
  const isFacilitator = meeting?.facilitatorUserId === viewerId
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [currentTrackSrc, setCurrentTrackSrc] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [volume, setVolume] = useState<number>(0.5)
  const [pausedAt, setPausedAt] = useState<number | null>(null)

  const pendingPlay = useRef<{trackSrc: string; timestamp: number | null} | null>(null)

  useEffect(() => {
    if (!meetingId) return

    const {musicSettings} = meeting || {}
    if (musicSettings) {
      const {trackSrc, isPlaying: shouldPlay, volume: newVolume} = musicSettings
      if (trackSrc !== currentTrackSrc) {
        setCurrentTrackSrc(trackSrc ?? null)
      }
      if (shouldPlay !== isPlaying) {
        setIsPlaying(shouldPlay ?? false)
      }
      if (newVolume !== null && newVolume !== undefined && newVolume !== volume) {
        setVolume(newVolume)
      }
    }
  }, [meeting, currentTrackSrc, isPlaying, volume])

  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.volume = 0
      audioRef.current.setAttribute('playsinline', 'true')
      audioRef.current.muted = true

      audioRef.current.src = '/static/sounds/quiet-lofi.mp3'
      audioRef.current.load()
      audioRef.current
        .play()
        .then(() => {
          audioRef.current!.pause()
        })
        .catch(() => {})

      audioRef.current.addEventListener('play', () => {
        if (pendingPlay.current) {
          audioRef.current!.muted = false
          audioRef.current!.volume = volume
        }
      })
    }

    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [volume])

  useEffect(() => {
    if (!audioRef.current) return

    if (currentTrackSrc) {
      if (audioRef.current.src !== currentTrackSrc) {
        audioRef.current.src = currentTrackSrc
        audioRef.current.load()
        if (pausedAt !== null) {
          audioRef.current.currentTime = pausedAt
        }
      }

      if (isPlaying) {
        audioRef.current.muted = true
        const playPromise = audioRef.current.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              audioRef.current!.muted = false
              audioRef.current!.volume = volume
            })
            .catch((err) => {
              if (err.name === 'NotAllowedError') {
                pendingPlay.current = {trackSrc: currentTrackSrc, timestamp: null}
              }
            })
        }
      } else {
        audioRef.current.pause()
      }
    } else {
      audioRef.current.pause()
    }
  }, [currentTrackSrc, isPlaying, pausedAt, volume])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    const handleDocumentClick = () => {
      if (pendingPlay.current && audioRef.current) {
        const {trackSrc} = pendingPlay.current

        if (currentTrackSrc === trackSrc) {
          audioRef.current.muted = true
          const playPromise = audioRef.current.play()
          playPromise
            .then(() => {
              audioRef.current!.muted = false
              audioRef.current!.volume = volume
            })
            .catch(() => {})
        } else {
          setCurrentTrackSrc(trackSrc)
          setIsPlaying(true)
        }

        pendingPlay.current = null
      }
    }

    document.addEventListener('click', handleDocumentClick)

    return () => {
      document.removeEventListener('click', handleDocumentClick)
    }
  }, [currentTrackSrc, volume])

  const syncMusicState = useCallback(
    (trackSrc: string | null, shouldPlay: boolean) => {
      if (!meetingId || !isFacilitator) return

      SetMeetingMusicMutation(
        atmosphere,
        {
          meetingId,
          trackSrc,
          isPlaying: shouldPlay,
          timestamp: shouldPlay && trackSrc ? Date.now() : null
        },
        {
          onError: (err) => console.error('[MusicSync] Error syncing music:', err),
          onCompleted: () => {}
        }
      )
    },
    [atmosphere, meetingId, isFacilitator]
  )

  const playTrack = useCallback(
    (trackSrc: string) => {
      if (trackSrc === currentTrackSrc && pausedAt !== null) {
        setIsPlaying(true)
      } else {
        setCurrentTrackSrc(trackSrc)
        setIsPlaying(true)
        setPausedAt(null)
      }

      if (isFacilitator) {
        syncMusicState(trackSrc, true)
      }
    },
    [currentTrackSrc, pausedAt, syncMusicState, isFacilitator]
  )

  const pause = useCallback(() => {
    if (audioRef.current) {
      setPausedAt(audioRef.current.currentTime)
    }
    setIsPlaying(false)

    if (isFacilitator) {
      syncMusicState(currentTrackSrc, false)
    }
  }, [currentTrackSrc, syncMusicState, isFacilitator])

  const stop = useCallback(() => {
    setCurrentTrackSrc(null)
    setIsPlaying(false)
    setPausedAt(null)

    if (isFacilitator) {
      syncMusicState(null, false)
    }
  }, [syncMusicState, isFacilitator])

  const selectTrack = useCallback(
    (trackSrc: string) => {
      setCurrentTrackSrc(trackSrc)
      setIsPlaying(false)
      setPausedAt(null)

      if (isFacilitator) {
        syncMusicState(trackSrc, false)
      }
    },
    [syncMusicState, isFacilitator]
  )

  const setVolumeLevel = useCallback((newVolume: number) => {
    const clamped = Math.max(0, Math.min(1, newVolume))
    setVolume(clamped)
  }, [])

  return {
    playTrack,
    pause,
    stop,
    setVolume: setVolumeLevel,
    selectTrack,
    currentTrackSrc,
    isPlaying,
    volume,
    availableTracks
  }
}

export default useMeetingMusicSync
