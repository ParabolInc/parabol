import AddToPhotosIcon from '@mui/icons-material/AddToPhotos'
import {type RefObject, useEffect, useState} from 'react'
import {DragAttribute} from '../types/constEnums'
import {cn} from '../ui/cn'

interface Props {
  scrollRef: RefObject<HTMLElement>
  similarGroupIds: ReadonlySet<string>
}

const GROUP_SELECTOR = `[${DragAttribute.DROPPABLE}]`

const getOffScreenCounts = (
  scrollEl: HTMLElement,
  similarIds: ReadonlySet<string>
): {above: number; below: number} => {
  const containerRect = scrollEl.getBoundingClientRect()
  let above = 0
  let below = 0
  const groups = Array.from(scrollEl.querySelectorAll<HTMLElement>(GROUP_SELECTOR))
  for (const group of groups) {
    const id = group.dataset.droppable
    if (!id || !similarIds.has(id)) continue
    const groupRect = group.getBoundingClientRect()
    if (groupRect.bottom < containerRect.top) above++
    else if (groupRect.top > containerRect.bottom) below++
  }
  return {above, below}
}

const scrollToNearest = (
  scrollEl: HTMLElement,
  similarIds: ReadonlySet<string>,
  dir: 'up' | 'down'
) => {
  const allGroups = Array.from(scrollEl.querySelectorAll<HTMLElement>(GROUP_SELECTOR))
  const targets = allGroups.filter(
    (g) => g.dataset.droppable && similarIds.has(g.dataset.droppable!)
  )
  if (targets.length === 0) return
  const containerRect = scrollEl.getBoundingClientRect()
  const target =
    dir === 'down'
      ? targets.find((g) => g.getBoundingClientRect().top > containerRect.bottom)
      : [...targets].reverse().find((g) => g.getBoundingClientRect().bottom < containerRect.top)
  if (!target) return
  target.scrollIntoView({behavior: 'smooth', block: 'nearest'})
}

const ScrollEdgeIndicator = ({scrollRef, similarGroupIds}: Props) => {
  const [counts, setCounts] = useState({above: 0, below: 0})

  useEffect(() => {
    const scrollEl = scrollRef.current
    if (!scrollEl || similarGroupIds.size === 0) {
      setCounts({above: 0, below: 0})
      return
    }
    const update = () => setCounts(getOffScreenCounts(scrollEl, similarGroupIds))
    update()
    scrollEl.addEventListener('scroll', update, {passive: true})
    return () => scrollEl.removeEventListener('scroll', update)
  }, [scrollRef, similarGroupIds])

  if (counts.above === 0 && counts.below === 0) return null
  return (
    <>
      {counts.above > 0 && (
        <button
          className={cn(
            '-translate-x-1/2 absolute top-10 left-1/2 z-10',
            'flex items-center gap-1 rounded-full bg-grape-500 px-2 py-0.5 font-semibold text-white text-xs shadow-md',
            'cursor-pointer transition-colors hover:bg-grape-600'
          )}
          onClick={() =>
            scrollRef.current && scrollToNearest(scrollRef.current, similarGroupIds, 'up')
          }
        >
          <span className='inline-flex items-center gap-1'>
            <span>↑ {counts.above} similar</span>
            <AddToPhotosIcon className='size-3' />
          </span>
        </button>
      )}
      {counts.below > 0 && (
        <button
          className={cn(
            '-translate-x-1/2 absolute bottom-2 left-1/2 z-10',
            'flex items-center gap-1 rounded-full bg-grape-500 px-2 py-0.5 font-semibold text-white text-xs shadow-md',
            'cursor-pointer transition-colors hover:bg-grape-600'
          )}
          onClick={() =>
            scrollRef.current && scrollToNearest(scrollRef.current, similarGroupIds, 'down')
          }
        >
          <span className='inline-flex items-center gap-1'>
            <span>↓ {counts.below} similar</span>
            <AddToPhotosIcon className='size-3' />
          </span>
        </button>
      )}
    </>
  )
}

export default ScrollEdgeIndicator
