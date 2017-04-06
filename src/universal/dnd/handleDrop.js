// if this isn't called, minY/maxY isn't reset
// given A,B. you can drag B -> A for B,A, but then you can't drag A back to B since minY === -1
export default function handleDrop({dragState}) {
  dragState.handleEndDrag();
}
