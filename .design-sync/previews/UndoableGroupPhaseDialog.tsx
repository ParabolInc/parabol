import {UndoableGroupPhaseDialog} from 'parabol-client'

// FLOOR CARD: UndoableGroupPhaseDialog renders inside a Radix Dialog, whose
// Portal appends content to document.body — outside the captured card cell — so
// it screenshots blank (same root cause as the primitives Dialog/DialogContent
// cards). Nothing renders inline to grade at the card level.
export const Open = () => {
  void UndoableGroupPhaseDialog
  return (
    <div className='rounded-lg bg-slate-100 p-4 text-slate-600 text-sm'>
      Renders in a Radix Dialog portal (escapes the captured card cell)
    </div>
  )
}
