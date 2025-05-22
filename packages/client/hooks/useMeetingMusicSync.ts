import graphql from 'babel-plugin-relay/macro'
import {useCallback, useEffect, useRef, useState} from 'react'
import {requestSubscription} from 'react-relay'
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
  meeting:
    | {
        id: string
        musicSettings?:
          | {
              trackSrc: string | null | undefined
              isPlaying: boolean | null | undefined
              volume: number | null | undefined
            }
          | null
          | undefined
      }
    | null
    | undefined
  isFacilitator: boolean
}

const subscription = graphql`
  subscription useMeetingMusicSyncSubscription($meetingId: ID!) {
    meetingSubscription(meetingId: $meetingId) {
      fieldName
      SetMeetingMusicSuccess {
        meetingId
        trackSrc
        isPlaying
        timestamp
      }
    }
  }
`

const useMeetingMusicSync = (props: MeetingMusicSyncProps) => {
  const {meeting, isFacilitator} = props
  const atmosphere = useAtmosphere()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const meetingId = meeting?.id

  // Track state locally for UI responsiveness
  const [currentTrackSrc, setCurrentTrackSrc] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [volume, setVolume] = useState<number>(0.5)
  const [pausedAt, setPausedAt] = useState<number | null>(null)

  const pendingPlay = useRef<{trackSrc: string; timestamp: number | null} | null>(null)

  // Set up subscription for music updates
  useEffect(() => {
    if (!meetingId) return

    console.log(`[MusicSync] Setting up subscription for meeting ${meetingId}`)

    const subscriptionConfig = {
      subscription,
      variables: {meetingId},
      onNext: (data: any) => {
        console.log('[MusicSync] Subscription data received:', data)
        if (data?.meetingSubscription) {
          const {fieldName, SetMeetingMusicSuccess} = data.meetingSubscription

          if (fieldName === 'SetMeetingMusicSuccess' && SetMeetingMusicSuccess) {
            const {trackSrc, isPlaying: shouldPlay, timestamp} = SetMeetingMusicSuccess

            console.log(
              `[MusicSync] Processing music update: track=${trackSrc}, play=${shouldPlay}, timestamp=${timestamp}`
            )

            // Update local state to match the subscription
            if (trackSrc) {
              console.log(`[MusicSync] Setting track: ${trackSrc}`)
              setCurrentTrackSrc(trackSrc)

              if (shouldPlay) {
                setIsPlaying(true)
                console.log('[MusicSync] Playing track from subscription')

                // Try to play muted immediately when we get the subscription
                if (audioRef.current) {
                  console.log('[MusicSync] Attempting muted autoplay on subscription')
                  audioRef.current.muted = true
                  audioRef.current
                    .play()
                    .then(() => {
                      console.log('[MusicSync] Muted autoplay successful, unmuting')
                      audioRef.current!.muted = false
                      audioRef.current!.volume = volume
                    })
                    .catch((err) => {
                      console.log('[MusicSync] Muted autoplay failed:', err)
                      // If autoplay fails, store for later user interaction
                      pendingPlay.current = {trackSrc, timestamp}
                    })
                }
              } else {
                setIsPlaying(false)
              }
            } else if (!trackSrc) {
              setCurrentTrackSrc(null)
              setIsPlaying(false)
              setPausedAt(null)
              console.log('[MusicSync] Stopping music from subscription')
            }
          }
        }
      },
      onError: (error: Error) => {
        console.error('[MusicSync] Subscription error:', error)
      }
    }

    // Register subscription
    const {dispose} = requestSubscription(atmosphere, subscriptionConfig)

    return () => {
      console.log('[MusicSync] Disposing subscription')
      dispose()
    }
  }, [atmosphere, meetingId, volume])

  // Initialize the audio player
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      console.log(`[MusicSync] Initializing audio player, volume: ${volume}`)
      audioRef.current = new Audio()
      audioRef.current.volume = 0 // Start muted
      audioRef.current.setAttribute('playsinline', 'true')
      audioRef.current.muted = true // Ensure it's muted

      // Try to play something muted immediately to get autoplay permission
      audioRef.current.src = '/static/sounds/quiet-lofi.mp3'
      audioRef.current.load()
      audioRef.current
        .play()
        .then(() => {
          console.log('[MusicSync] Initial muted autoplay successful')
          audioRef.current!.pause()
        })
        .catch((err) => {
          console.log('[MusicSync] Initial muted autoplay failed:', err)
        })

      audioRef.current.addEventListener('play', () => {
        console.log(`[MusicSync] HTML5 Audio play event fired`)
        // Once playing, unmute if we have a pending play
        if (pendingPlay.current) {
          console.log('[MusicSync] Unmuting audio after successful play')
          audioRef.current!.muted = false
          audioRef.current!.volume = volume
        }
      })

      audioRef.current.addEventListener('pause', () => {
        console.log(`[MusicSync] HTML5 Audio pause event fired`)
      })

      audioRef.current.addEventListener('error', (e) => {
        console.error(`[MusicSync] HTML5 Audio error:`, e)
      })
    }

    return () => {
      console.log(`[MusicSync] Cleanup - stopping audio`)
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [volume])

  // Handle audio playback state changes
  useEffect(() => {
    if (!audioRef.current) return

    if (currentTrackSrc) {
      if (audioRef.current.src !== currentTrackSrc) {
        console.log(`[MusicSync] Setting track src: ${currentTrackSrc}`)
        audioRef.current.src = currentTrackSrc
        audioRef.current.load() // Force preload of the audio
        if (pausedAt !== null) {
          console.log(`[MusicSync] Resuming from: ${pausedAt}`)
          audioRef.current.currentTime = pausedAt
        }
      }

      if (isPlaying) {
        console.log(`[MusicSync] Attempting to play audio: ${currentTrackSrc}`)
        // Try to play muted first
        audioRef.current.muted = true
        const playPromise = audioRef.current.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('[MusicSync] Audio playback started successfully')
              // Once playing, unmute
              audioRef.current!.muted = false
              audioRef.current!.volume = volume
            })
            .catch((err) => {
              console.error('[MusicSync] Error playing audio:', err)
              // If there was an autoplay error, try again on user interaction
              if (err.name === 'NotAllowedError') {
                console.log('[MusicSync] Autoplay blocked, will try again after user interaction')
                pendingPlay.current = {trackSrc: currentTrackSrc, timestamp: null}
              }
            })
        }
      } else {
        console.log(`[MusicSync] Pausing audio: ${currentTrackSrc}`)
        audioRef.current.pause()
      }
    } else {
      console.log(`[MusicSync] No track selected, stopping audio`)
      audioRef.current.pause()
    }
  }, [currentTrackSrc, isPlaying, pausedAt, volume])

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  // Add a document click listener to help with autoplay
  useEffect(() => {
    const handleDocumentClick = () => {
      // When user interacts with the page, check if we have a pending play request
      if (pendingPlay.current && audioRef.current) {
        const {trackSrc} = pendingPlay.current
        console.log('[MusicSync] User interacted with page, playing pending track:', trackSrc)

        if (currentTrackSrc === trackSrc) {
          // Try playing muted first
          audioRef.current.muted = true
          const playPromise = audioRef.current.play()
          playPromise
            .then(() => {
              console.log('[MusicSync] Audio started after user interaction')
              // Once playing, unmute
              audioRef.current!.muted = false
              audioRef.current!.volume = volume
            })
            .catch((err) => console.error('[MusicSync] Error playing after click:', err))
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

  // Sync music state to the server when facilitator makes changes
  const syncMusicState = useCallback(
    (trackSrc: string | null, shouldPlay: boolean) => {
      if (!meetingId || !isFacilitator) return

      console.log(`[MusicSync] Facilitator syncing music: track=${trackSrc}, playing=${shouldPlay}`)

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
          onCompleted: (res) => {
            console.log('[MusicSync] Mutation completed:', res)
          }
        }
      )
    },
    [atmosphere, meetingId, isFacilitator]
  )

  // Music control functions
  const playTrack = useCallback(
    (trackSrc: string) => {
      console.log(`[MusicSync] playTrack called with: ${trackSrc}`)
      setCurrentTrackSrc(trackSrc)
      setIsPlaying(true)
      setPausedAt(null)

      // Only sync to everyone if facilitator
      if (isFacilitator) {
        syncMusicState(trackSrc, true)
      }
    },
    [syncMusicState, isFacilitator]
  )

  const pause = useCallback(() => {
    console.log(`[MusicSync] pause called`)
    if (audioRef.current) {
      setPausedAt(audioRef.current.currentTime)
    }
    setIsPlaying(false)

    // Only sync to everyone if facilitator
    if (isFacilitator) {
      syncMusicState(currentTrackSrc, false)
    }
  }, [currentTrackSrc, syncMusicState, isFacilitator])

  const stop = useCallback(() => {
    console.log(`[MusicSync] stop called`)
    setCurrentTrackSrc(null)
    setIsPlaying(false)
    setPausedAt(null)

    // Only sync to everyone if facilitator
    if (isFacilitator) {
      syncMusicState(null, false)
    }
  }, [syncMusicState, isFacilitator])

  const selectTrack = useCallback(
    (trackSrc: string) => {
      console.log(`[MusicSync] selectTrack called with: ${trackSrc}`)
      setCurrentTrackSrc(trackSrc)
      setIsPlaying(false)
      setPausedAt(null)

      // Only sync to everyone if facilitator
      if (isFacilitator) {
        syncMusicState(trackSrc, false)
      }
    },
    [syncMusicState, isFacilitator]
  )

  const setVolumeLevel = useCallback((newVolume: number) => {
    const clamped = Math.max(0, Math.min(1, newVolume))
    console.log(`[MusicSync] setVolume: ${clamped}`)
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
