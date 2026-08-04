import type {SuggestedGroupsSettings} from '../hooks/useSuggestedGroupsSettings'
import {Button} from '../ui/Button/Button'
import SuggestedGroupsSubmitButton from './SuggestedGroupsSubmitButton'

type Props = {
  onSubmit: () => void
  /** Clears the badges off this viewer's board. Absent until there is a set showing to remove */
  onRemove?: () => void
  settings: SuggestedGroupsSettings
  updateSettings: (patch: Partial<SuggestedGroupsSettings>) => void
  submitting: boolean
  /** Draft settings already match what's applied — nothing for Apply to do */
  isUpToDate: boolean
  /** Why Custom Instructions is unavailable, if it is */
  aiDisabledReason: string | null
}

const SuggestedGroupsPanel = (props: Props) => {
  const {onSubmit, onRemove, settings, updateSettings, submitting, isUpToDate, aiDisabledReason} =
    props
  const {mode, userPrompt, sameColumnOnly} = settings
  const isAI = mode === 'ai'

  return (
    <div className='p-4'>
      <div className='font-semibold text-fg-primary text-lg'>{'Group by'}</div>

      <div className='mt-3 flex gap-1.5 rounded-lg bg-surface-well p-1'>
        <button
          type='button'
          onClick={() => updateSettings({mode: 'similarity'})}
          className={`flex-1 rounded-md px-3 py-1.5 font-semibold text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            isAI ? 'bg-transparent text-fg-secondary' : 'bg-surface-card text-fg-primary'
          }`}
        >
          {'Similar Wording'}
        </button>
        <button
          type='button'
          disabled={!!aiDisabledReason}
          title={aiDisabledReason ?? undefined}
          onClick={() => updateSettings({mode: 'ai'})}
          className={`flex-1 rounded-md px-3 py-1.5 font-semibold text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            isAI ? 'bg-surface-card text-fg-primary' : 'bg-transparent text-fg-secondary'
          }`}
        >
          {'Custom'}
        </button>
      </div>

      {isAI && !aiDisabledReason && (
        <textarea
          className='mt-3 min-h-20 w-full resize-y rounded-md border border-hairline-field p-2 text-fg-primary text-sm focus:border-accent focus:outline-none'
          value={userPrompt}
          onChange={(e) => updateSettings({userPrompt: e.target.value})}
          placeholder='Optional: group by root cause rather than by symptom'
        />
      )}

      <label className='mt-3 flex cursor-pointer items-center gap-3'>
        <span
          role='switch'
          aria-checked={sameColumnOnly === false}
          onClick={() => updateSettings({sameColumnOnly: !sameColumnOnly})}
          className={`relative h-[18px] w-8 shrink-0 rounded-full transition-colors ${
            sameColumnOnly ? 'bg-hairline-field' : 'bg-accent'
          }`}
        >
          <span
            className='absolute top-0.5 size-[14px] rounded-full bg-white shadow transition-all'
            style={{left: sameColumnOnly ? 2 : 16}}
          />
        </span>
        <span className='text-fg-primary text-sm'>{'Group across columns'}</span>
      </label>

      <div className='mt-4 flex items-center gap-2'>
        {onRemove && (
          <Button
            variant='flat'
            size='sm'
            onClick={onRemove}
            disabled={submitting}
            className='shrink-0 font-semibold text-fg-secondary'
          >
            {'Remove suggestions'}
          </Button>
        )}
        <SuggestedGroupsSubmitButton
          onSubmit={onSubmit}
          submitting={submitting}
          isUpToDate={isUpToDate}
          mode={mode}
        />
      </div>
    </div>
  )
}

export default SuggestedGroupsPanel
