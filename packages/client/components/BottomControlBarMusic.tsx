import HeadphonesIcon from '@mui/icons-material/Headphones'
import IconButton from '@mui/material/IconButton'
import * as RadixPopover from '@radix-ui/react-popover'
import {useEffect, useRef, useState} from 'react'
import {
  availableTracks,
  Track,
  useBackgroundMusic
} from './AtmosphereProvider/BackgroundMusicProvider/BackgroundMusicProvider'

interface Props {
  isFacilitator: boolean
}

const BottomControlBarMusic = ({isFacilitator}: Props) => {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const {playTrack, pause, stop, setVolume, selectTrack, currentTrackSrc, isPlaying, volume} =
    useBackgroundMusic()

  const [localSelectedTrack, setLocalSelectedTrack] = useState<string | null>(currentTrackSrc)
  useEffect(() => {
    setLocalSelectedTrack(currentTrackSrc)
  }, [currentTrackSrc])

  if (!isFacilitator) return null

  return (
    <RadixPopover.Root open={open} onOpenChange={setOpen}>
      <RadixPopover.Trigger asChild>
        <IconButton
          ref={buttonRef}
          aria-label='Background music'
          size='large'
          onMouseDown={(e) => e.stopPropagation()}
          className='hover:!bg-gray-100 !rounded-full !bg-white !p-1 !shadow-none transition'
        >
          <HeadphonesIcon className='text-gray-500' />
        </IconButton>
      </RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          sideOffset={8}
          className='background-music-popover z-50 data-[side=bottom]:animate-slide-down data-[side=top]:animate-slide-up'
        >
          <div className='border-gray-100 flex min-w-[260px] flex-col gap-4 rounded-xl border bg-white p-4 shadow-xl'>
            <div className='mb-1 flex items-center gap-2'>
              <HeadphonesIcon className='text-blue-500' fontSize='small' />
              <span className='text-gray-800 text-base font-semibold'>Background music</span>
            </div>
            <div className='flex flex-col gap-2'>
              {availableTracks.map((track: Track) => (
                <button
                  key={track.src}
                  onClick={() => {
                    setLocalSelectedTrack(track.src)
                    selectTrack(track.src)
                  }}
                  className={`group flex items-center gap-2 rounded-lg border px-3 py-2 transition-all ${
                    localSelectedTrack === track.src
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold shadow'
                      : 'hover:bg-gray-50 text-gray-700 border-transparent'
                  } `}
                >
                  <span className='flex-1 truncate'>{track.name}</span>
                  {localSelectedTrack === track.src && (
                    <span className='bg-blue-100 text-blue-700 rounded px-2 py-0.5 text-xs font-medium'>
                      {isPlaying ? 'Playing' : 'Selected'}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className='mt-2 flex items-center justify-between gap-2'>
              <button
                onClick={() => localSelectedTrack && playTrack(localSelectedTrack)}
                disabled={!localSelectedTrack}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  !localSelectedTrack
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                } `}
              >
                Play
              </button>
              <button
                onClick={pause}
                disabled={!isPlaying}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  !isPlaying
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                } `}
              >
                Pause
              </button>
              <button
                onClick={stop}
                disabled={!localSelectedTrack}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  !localSelectedTrack
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } `}
              >
                Stop
              </button>
            </div>
            <div className='mt-2 flex items-center gap-3'>
              <span className='text-gray-500 w-14 text-sm'>Volume</span>
              <input
                type='range'
                min='0'
                max='1'
                step='0.01'
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className='accent-blue-500 h-2 flex-1'
              />
            </div>
          </div>
          <RadixPopover.Arrow className='fill-white' />
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  )
}

export default BottomControlBarMusic
