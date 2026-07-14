import {ExpandedReflectionStack} from 'parabol-client'

// FLOOR CARD: ExpandedReflectionStack computes a phase bounding box from a live
// phaseRef (returns null without one) and maps live Relay reflections into
// DraggableReflectionCards, so it cannot render from static props.
export const FloorCard = () => {
  void ExpandedReflectionStack
  return (
    <div className='rounded-lg bg-slate-100 p-4 text-slate-600 text-sm'>
      Requires live phaseRef bounding box + Relay reflection data
    </div>
  )
}
