import type {ReactNode} from 'react'
import {AutoAwesome} from '~/ui/icons'
import {cn} from '../../ui/cn'
import type {ReportAskOption} from './reportAskOptions'

interface Props {
  listboxId: string
  options: ReportAskOption[]
  activeIndex: number
  canAsk: boolean
  notice: ReactNode
  onChoose: (option: ReportAskOption) => void
  onHover: (index: number) => void
}

const optionClassName = (isActive: boolean) =>
  cn(
    'mx-1 flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm',
    isActive && 'bg-surface-hover'
  )

// Listed options are grouped under their section, and popular ones under their subject when nothing is typed
const ReportAskMenu = ({
  listboxId,
  options,
  activeIndex,
  canAsk,
  notice,
  onChoose,
  onHover
}: Props) => {
  const optionProps = (index: number, option: ReportAskOption) => ({
    id: `${listboxId}-${index}`,
    role: 'option',
    'aria-selected': index === activeIndex,
    className: optionClassName(index === activeIndex),
    // keep focus in the box, so choosing doesn't close the menu first
    onMouseDown: (event: React.MouseEvent) => event.preventDefault(),
    onClick: () => onChoose(option),
    onMouseMove: () => onHover(index)
  })
  return (
    <div className='absolute top-full right-0 left-0 z-20 mt-1 flex max-h-[min(480px,60vh)] flex-col overflow-hidden rounded-lg border border-hairline bg-surface-modal shadow-[var(--shadow-card-raised)]'>
      {notice && (
        <div className='border-hairline border-b px-4 py-2.5 text-fg-secondary text-sm'>
          {notice}
        </div>
      )}
      <div role='listbox' id={listboxId} aria-label='Questions' className='overflow-y-auto py-1'>
        {options.map((option, index) => {
          if (option.kind === 'ask') {
            return (
              <div key={option.id} {...optionProps(index, option)}>
                <AutoAwesome className='shrink-0 text-[18px] text-sky-600 dark:text-accent' />
                <span className='min-w-0 flex-1 truncate'>
                  Ask <strong className='font-semibold'>“{option.question}”</strong>
                </span>
                <kbd className='font-sans text-fg-muted text-xs'>Enter</kbd>
              </div>
            )
          }
          const previous = options[index - 1]
          const isNewSection =
            !previous || previous.kind === 'ask' || previous.section !== option.section
          const isNewGroup = isNewSection || previous.group !== option.group
          const label = option.group ?? option.section
          return (
            <div key={option.id} role='presentation'>
              {isNewSection && option.group && (
                <div
                  aria-hidden
                  className='px-4 pt-3 font-semibold text-fg-muted text-xs uppercase tracking-wide'
                >
                  {option.section}
                </div>
              )}
              {isNewGroup && (
                <div
                  aria-hidden
                  className={cn(
                    'px-4 pt-3 pb-1 font-semibold text-xs',
                    option.group
                      ? 'pt-2 text-fg-secondary'
                      : 'text-fg-muted uppercase tracking-wide'
                  )}
                >
                  {label}
                </div>
              )}
              <div
                {...optionProps(index, option)}
                aria-label={`${option.parts.map(({text}) => text).join('')}, ${label}`}
              >
                <span className='min-w-0 flex-1'>
                  {option.parts.map(({text, isMatch}, partIndex) =>
                    isMatch ? (
                      <strong key={partIndex} className='font-semibold'>
                        {text}
                      </strong>
                    ) : (
                      <span key={partIndex}>{text}</span>
                    )
                  )}
                </span>
                <span className='shrink-0 text-fg-muted text-xs'>{option.detail}</span>
              </div>
            </div>
          )
        })}
        {options.length === 0 && (
          <p className='m-0 px-4 py-3 text-fg-muted text-sm'>No popular questions match</p>
        )}
      </div>
      <div className='flex flex-wrap gap-x-4 gap-y-1 border-hairline border-t px-4 py-2 text-fg-muted text-xs'>
        <span>
          <kbd className='font-sans font-semibold'>↑↓</kbd> to choose
        </span>
        <span>
          <kbd className='font-sans font-semibold'>Enter</kbd> to {canAsk ? 'open or ask' : 'open'}
        </span>
        <span>
          <kbd className='font-sans font-semibold'>Esc</kbd> to close
        </span>
      </div>
    </div>
  )
}

export default ReportAskMenu
