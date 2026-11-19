import {useState} from 'react'
import {Check as CheckIcon, Close as CloseIcon, ContentCopy as ContentCopyIcon} from '~/ui/icons'
import BasicInput from '../../../../components/InputField/BasicInput'
import {cn} from '../../../../ui/cn'

export const MASKED_SECRET = '••••••••••••••••••••'

interface Props {
  clientSecret: string
  showSecret: boolean
  canRegenerate: boolean
  onRegenerate: () => void
}

const OAuthClientSecretField = ({clientSecret, showSecret, canRegenerate, onRegenerate}: Props) => {
  const [isConfirming, setIsConfirming] = useState(false)
  const isRevealed = clientSecret !== MASKED_SECRET
  return (
    <div className='space-y-1'>
      <div className='flex h-5 items-center justify-between'>
        <label className='font-semibold text-fg-muted text-xs uppercase tracking-wider'>
          Client Secret
        </label>
        {canRegenerate && (
          <div className='flex items-center gap-2'>
            {isConfirming ? (
              <>
                <span className='text-fg-muted text-xs'>Are you sure?</span>
                <button
                  type='button'
                  onClick={() => {
                    setIsConfirming(false)
                    onRegenerate()
                  }}
                  className='text-fg-muted hover:text-jade-600'
                  title='Confirm Regenerate'
                >
                  <CheckIcon className='text-[20px]' />
                </button>
                <button
                  type='button'
                  onClick={() => setIsConfirming(false)}
                  className='text-fg-muted hover:text-tomato-600'
                  title='Cancel'
                >
                  <CloseIcon className='text-[20px]' />
                </button>
              </>
            ) : (
              <button
                type='button'
                onClick={() => setIsConfirming(true)}
                className='font-semibold text-fg-muted text-xs tracking-wider hover:text-fg-primary'
              >
                Regenerate
              </button>
            )}
          </div>
        )}
      </div>
      <div className='flex'>
        <div className='relative grow'>
          <BasicInput
            name='clientSecret'
            autoComplete='new-password'
            value={clientSecret}
            disabled
            placeholder='Save to reveal...'
            onChange={() => {}}
            className={cn(
              'w-full bg-surface-well font-mono text-sm',
              isRevealed && 'rounded-r-none border-hairline! border-r-0!'
            )}
            type={showSecret ? 'text' : 'password'}
            error={undefined}
          />
        </div>
        {isRevealed && (
          <button
            type='button'
            onClick={() => navigator.clipboard.writeText(clientSecret)}
            className='-ml-px relative inline-flex items-center space-x-2 rounded-r-md border border-hairline bg-surface-well px-4 py-0 font-medium text-fg-primary text-sm hover:bg-surface-hover'
          >
            <ContentCopyIcon className='text-[20px]' />
          </button>
        )}
      </div>
    </div>
  )
}

export default OAuthClientSecretField
