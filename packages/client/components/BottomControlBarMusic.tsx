import HeadphonesIcon from '@mui/icons-material/Headphones'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import StopIcon from '@mui/icons-material/Stop'
import * as RadixPopover from '@radix-ui/react-popover'
import {useRef, useState} from 'react'
import {TransitionStatus} from '~/hooks/useTransition'
import useMeetingMusicSync from '../hooks/useMeetingMusicSync'
import {cn} from '../ui/cn'
import BottomNavControl from './BottomNavControl'

interface Props {
  status?: TransitionStatus
  onTransitionEnd?: () => void
  meetingId: string
}

const BottomControlBarMusic = ({
  status = TransitionStatus.ENTERED,
  onTransitionEnd,
  meetingId
}: Props) => {
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
          status={status}
          onTransitionEnd={onTransitionEnd}
          className='meeting-control-bar-button flex flex-col items-center justify-center'
          aria-label='Background music'
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className='flex flex-col items-center justify-center'>
            <HeadphonesIcon
              className={cn(isPlaying ? 'animate-pulse text-slate-700' : 'text-slate-700')}
              fontSize='medium'
            />
            <span className='mt-0.5 text-xs font-medium text-slate-600'>Music</span>
          </span>
        </BottomNavControl>
      </RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          sideOffset={2}
          className={`background-music-popover z-10 m-0 w-64 max-w-md min-w-[14rem] p-0`}
        >
          <div className='flex flex-col gap-4 rounded-lg bg-white p-4 shadow-2xl'>
            <div className='mb-1 flex items-center gap-2'>
              <HeadphonesIcon className='text-blue-500' fontSize='small' />
              <span className='text-gray-800 text-base font-semibold'>Background music</span>
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
                        'box-border flex w-full appearance-none items-center gap-2 rounded-lg border bg-slate-200 px-3 py-2 text-base leading-tight font-normal transition-colors outline-none focus:outline-none',
                        isSelected
                          ? 'font-semibold shadow'
                          : 'cursor-pointer border-transparent text-slate-700 hover:bg-slate-300 hover:text-slate-900'
                      )}
                    >
                      <span className='flex-1 truncate'>{track.name}</span>
                    </button>
                  )
                })}
              </div>
              {showFade && (
                <div className='pointer-events-none absolute right-0 bottom-0 left-0 h-8 bg-gradient-to-t from-white to-transparent' />
              )}
            </div>

            <div className='mt-2 flex items-center justify-center gap-4'>
              <button
                type='button'
                onClick={() => playTrack(currentTrackSrc)}
                disabled={!playEnabled}
                className={cn(
                  'flex min-w-[48px] items-center justify-center rounded-full px-3 py-2 text-sm font-semibold transition',
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
                  'flex min-w-[48px] items-center justify-center rounded-full px-3 py-2 text-sm font-semibold transition',
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
              <span className='text-gray-500 w-14 text-sm'>Volume</span>
              <div className='min-w-0 flex-1'>
                <input
                  type='range'
                  min='0'
                  max='1'
                  step='0.01'
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className='accent-blue-500 h-2 w-full cursor-pointer transition-all duration-200 ease-in-out hover:opacity-100'
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
