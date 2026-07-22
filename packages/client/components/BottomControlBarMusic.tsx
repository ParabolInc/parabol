import HeadphonesIcon from '@mui/icons-material/Headphones'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import StopIcon from '@mui/icons-material/Stop'
import * as RadixPopover from '@radix-ui/react-popover'
import {useRef, useState} from 'react'
import useMeetingMusicSync from '../hooks/useMeetingMusicSync'
import {cn} from '../ui/cn'
import BottomNavControl from './BottomNavControl'

interface Props {
  meetingId: string
}

const BottomControlBarMusic = ({meetingId}: Props) => {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [atBottom, setAtBottom] = useState(false)

  const {
    playTrack,
    stop,
    handleVolumeChange,
    selectTrack,
    currentTrackSrc,
    isPlaying,
    volume,
    availableTracks
  } = useMeetingMusicSync(meetingId)

  const playEnabled = !!currentTrackSrc && !isPlaying
  const stopEnabled = !!currentTrackSrc && isPlaying
  const showFade = availableTracks.length > 3 && !atBottom

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 2)
  }

  return (
    <RadixPopover.Root open={open} onOpenChange={setOpen}>
      <RadixPopover.Trigger asChild>
        <BottomNavControl
          ref={buttonRef}
          aria-label='Background music'
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className='flex flex-col items-center justify-center px-2 pt-2 pb-1'>
            <HeadphonesIcon
              className={cn(
                'size-6',
                isPlaying ? 'animate-pulse text-fg-primary' : 'text-fg-primary'
              )}
              fontSize='medium'
            />
            <span className='mt-0.5 font-medium text-fg-primary text-xs'>Music</span>
          </span>
        </BottomNavControl>
      </RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          sideOffset={2}
          className={`background-music-popover z-10 m-0 w-64 min-w-[14rem] max-w-md p-0`}
        >
          <div className='flex flex-col gap-4 rounded-lg bg-surface-card p-4 shadow-2xl'>
            <div className='mb-1 flex items-center gap-2'>
              <HeadphonesIcon className='text-blue-500' fontSize='small' />
              <span className='font-semibold text-base text-fg-primary'>Background music</span>
            </div>
            <div className='relative'>
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className={cn(
                  'scrollbar-thin flex flex-col gap-2 overflow-y-auto',
                  availableTracks.length > 3 ? 'max-h-[200px] pr-1 pb-4' : ''
                )}
              >
                {availableTracks.map((track) => {
                  const isSelected = currentTrackSrc === track.src

                  return (
                    <button
                      key={track.src}
                      onClick={() => {
                        if (isSelected) {
                          stop()
                        } else {
                          selectTrack(track.src)
                        }
                      }}
                      className={cn(
                        'box-border flex w-full appearance-none items-center gap-2 rounded-lg border bg-surface-well px-3 py-2 font-normal text-base leading-tight outline-none transition-colors focus:outline-none',
                        isSelected
                          ? 'font-semibold shadow'
                          : 'cursor-pointer border-transparent text-fg-primary hover:bg-surface-hover hover:text-fg-primary'
                      )}
                    >
                      <span className='flex-1 truncate'>{track.name}</span>
                    </button>
                  )
                })}
              </div>
              {showFade && (
                <div className='pointer-events-none absolute right-0 bottom-0 left-0 h-8 bg-gradient-to-t from-surface-card to-transparent' />
              )}
            </div>

            <div className='mt-2 flex items-center justify-center gap-4'>
              <button
                type='button'
                onClick={() => playTrack(currentTrackSrc)}
                disabled={!playEnabled}
                className={cn(
                  'flex min-w-[48px] items-center justify-center rounded-full px-3 py-2 font-semibold text-sm transition',
                  playEnabled
                    ? 'cursor-pointer bg-jade-500 text-white shadow-sm hover:bg-jade-400'
                    : 'cursor-not-allowed bg-jade-100 text-jade-300'
                )}
                aria-label='Play'
              >
                <PlayArrowIcon />
              </button>
              <button
                type='button'
                onClick={stop}
                disabled={!stopEnabled}
                className={cn(
                  'flex min-w-[48px] items-center justify-center rounded-full px-3 py-2 font-semibold text-sm transition',
                  stopEnabled
                    ? 'cursor-pointer bg-tomato-600 text-white shadow-sm hover:bg-tomato-500'
                    : 'cursor-not-allowed bg-tomato-100 text-tomato-400'
                )}
                aria-label='Stop'
              >
                <StopIcon />
              </button>
            </div>

            <div className='mt-2 flex items-center gap-3'>
              <span className='w-14 text-fg-secondary text-sm'>Volume</span>
              <div className='min-w-0 flex-1'>
                <input
                  type='range'
                  min='0'
                  max='1'
                  step='0.01'
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className='h-2 w-full cursor-pointer accent-blue-500 transition-all duration-200 ease-in-out hover:opacity-100'
                  onMouseDown={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          </div>
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  )
}

export default BottomControlBarMusic
