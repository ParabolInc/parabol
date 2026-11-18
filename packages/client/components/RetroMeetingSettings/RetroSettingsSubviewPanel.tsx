import type {ReactNode} from 'react'
import {GlobalBanner} from '../../types/constEnums'
import {ArrowBack, Close} from '../../ui/icons'

const isGlobalBannerEnabled = window.__ACTION__.GLOBAL_BANNER_ENABLED

interface Props {
  title: string
  onBack: () => void
  onClose: () => void
  children: ReactNode
}

const iconButtonClass =
  'flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-md border-none bg-transparent text-fg-secondary hover:bg-surface-hover hover:text-fg-primary'

const RetroSettingsSubviewPanel = ({title, onBack, onClose, children}: Props) => (
  <div
    className='flex h-full w-[360px] flex-col overflow-hidden border-hairline border-l bg-surface-drawer'
    style={{paddingTop: isGlobalBannerEnabled ? GlobalBanner.HEIGHT : 0}}
  >
    <div className='flex h-14 shrink-0 items-center gap-1 border-hairline border-b pr-2 pl-1'>
      <button
        type='button'
        aria-label='Back to settings'
        onClick={onBack}
        className={iconButtonClass}
      >
        <ArrowBack />
      </button>
      <h2 className='m-0 flex-1 font-semibold text-base text-fg-primary'>{title}</h2>
      <button type='button' aria-label='Close drawer' onClick={onClose} className={iconButtonClass}>
        <Close />
      </button>
    </div>
    {children}
  </div>
)

export default RetroSettingsSubviewPanel
