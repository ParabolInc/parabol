import graphql from 'babel-plugin-relay/macro'
import {useEffect, useRef, useState} from 'react'
import {useLazyLoadQuery} from 'react-relay'
import {useMeetingMusicSyncQuery} from '../__generated__/useMeetingMusicSyncQuery.graphql'
import SetMeetingMusicMutation from '../mutations/SetMeetingMusicMutation'
import useAtmosphere from './useAtmosphere'
import useMutationProps from './useMutationProps'

export const availableTracks = [
  {name: 'Lo-fi Hip Hop Night', src: '/static/sounds/lofi-hip-hop-night.mp3'},
  {name: 'Lo-fi Coffee', src: '/static/sounds/coffee-lofi.mp3'},
  {name: 'Lo-fi Quiet', src: '/static/sounds/quiet-lofi.mp3'},
  {name: 'Lo-fi Tokyo', src: '/static/sounds/tokyo-lofi.mp3'},
  {name: 'Lo-fi Ambient', src: '/static/sounds/lofi-ambient.mp3'}
]

const useMeetingMusicSync = (meetingId: string) => {
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const {onError, onCompleted, submitMutation} = useMutationProps()
  const data = useLazyLoadQuery<useMeetingMusicSyncQuery>(
    graphql`
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
    `,
    {meetingId}
  )
  const meeting = data.viewer?.meeting
  const isFacilitator = meeting?.facilitatorUserId === viewerId
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [currentTrackSrc, setCurrentTrackSrc] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [volume, setVolume] = useState<number>(0.5)
  const [pausedAt, setPausedAt] = useState<number | null>(null)

  const pendingPlay = useRef<{trackSrc: string; timestamp: number | null} | null>(null)

  // Sync volume from server to local state
  useEffect(() => {
    const newVolume = meeting?.musicSettings?.volume
    if (newVolume && newVolume !== volume) {
      setVolume(newVolume)
    }
  }, [meeting?.musicSettings?.volume])

  // Sync local volume state to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  // Sync play state and track from server
  useEffect(() => {
    const {musicSettings} = meeting || {}
    if (!musicSettings || pausedAt !== null) return

    const {trackSrc, isPlaying: shouldPlay} = musicSettings

    const shouldSyncTrack = isFacilitator
      ? trackSrc !== currentTrackSrc
      : shouldPlay && !currentTrackSrc && trackSrc

    if (shouldPlay !== isPlaying) setIsPlaying(shouldPlay ?? false)
    if (shouldSyncTrack) setCurrentTrackSrc(trackSrc ?? null)
  }, [meeting?.musicSettings, currentTrackSrc, pausedAt, isFacilitator])

  // Initialize audio element and prepare for autoplay restrictions
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.volume = volume
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
  }, [])

  // Control audio playback based on state changes
  useEffect(() => {
    if (!audioRef.current) return

    if (!currentTrackSrc || !isPlaying) {
      audioRef.current.pause()
      return
    }

    if (audioRef.current.src !== currentTrackSrc) {
      audioRef.current.src = currentTrackSrc
      audioRef.current.load()
    }

    if (pausedAt !== null) {
      audioRef.current.currentTime = pausedAt
      setPausedAt(null)
    }

    audioRef.current.muted = true
    const playPromise = audioRef.current.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          audioRef.current!.muted = false
        })
        .catch((err) => {
          if (err.name === 'NotAllowedError') {
            pendingPlay.current = {trackSrc: currentTrackSrc, timestamp: null}
          }
        })
    }
  }, [currentTrackSrc, isPlaying, pausedAt])

  // Handle autoplay restrictions by waiting for user interaction
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
    return () => document.removeEventListener('click', handleDocumentClick)
  }, [currentTrackSrc, volume])

  const syncMusicState = (trackSrc: string | null, shouldPlay: boolean) => {
    if (!meetingId || !isFacilitator) return

    submitMutation()
    SetMeetingMusicMutation(
      atmosphere,
      {
        meetingId,
        trackSrc,
        isPlaying: shouldPlay,
        timestamp: shouldPlay && trackSrc ? Date.now() : null
      },
      {onError, onCompleted}
    )
  }

  const playTrack = (trackSrc: string | null) => {
    if (!trackSrc) return

    const isResumingSameTrack = trackSrc === currentTrackSrc && pausedAt !== null
    setIsPlaying(true)

    if (!isResumingSameTrack) {
      setCurrentTrackSrc(trackSrc)
      setPausedAt(null)
    }

    if (isFacilitator) {
      syncMusicState(trackSrc, true)
    }
  }

  const pause = () => {
    if (audioRef.current) {
      setPausedAt(audioRef.current.currentTime)
    }
    setIsPlaying(false)

    if (isFacilitator) {
      syncMusicState(currentTrackSrc, false)
    }
  }

  const stop = () => {
    setCurrentTrackSrc(null)
    setIsPlaying(false)
    setPausedAt(null)

    if (isFacilitator) {
      syncMusicState(null, false)
    } else {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }

  const selectTrack = (trackSrc: string) => {
    setCurrentTrackSrc(trackSrc)
    setIsPlaying(false)
    setPausedAt(null)

    if (isFacilitator) {
      syncMusicState(trackSrc, false)
    } else {
      if (audioRef.current) {
        audioRef.current.src = trackSrc
        audioRef.current.load()
      }
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    const roundedVolume = Math.round(newVolume * 100) / 100
    setVolume(roundedVolume)
  }

  return {
    playTrack,
    pause,
    stop,
    handleVolumeChange,
    selectTrack,
    currentTrackSrc,
    isPlaying,
    volume,
    availableTracks
  }
}

export default useMeetingMusicSync
