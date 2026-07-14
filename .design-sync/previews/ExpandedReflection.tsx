import {ExpandedReflection} from 'parabol-client'

// FLOOR CARD: ExpandedReflection renders DraggableReflectionCard, which requires
// live Relay reflection + meeting fragments and drag context to render.
export const FloorCard = () => {
  void ExpandedReflection
  return (
    <div className='rounded-lg bg-slate-100 p-4 text-slate-600 text-sm'>
      Requires live Relay reflection + meeting data (DraggableReflectionCard)
    </div>
  )
}
