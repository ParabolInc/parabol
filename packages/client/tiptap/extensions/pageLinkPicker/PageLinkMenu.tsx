import type {SuggestionProps} from '@tiptap/suggestion'
import type React from 'react'
import {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react'

export const PageLinkMenu = forwardRef(
  (props: SuggestionProps<{pageId: string; title: string}>, ref) => {
    const {items, command} = props
    const [selectedIndex, setSelectedIndex] = useState(0)
    const activeRef = useRef<HTMLDivElement>(null)
    const activeItem = items[selectedIndex]
    const selectItem = (pageId: string) => {
      const item = items.find((item) => item.pageId === pageId)
      if (!item) return
      command(item)
    }

    const upHandler = () => {
      setSelectedIndex((selectedIndex + items.length - 1) % items.length)
    }

    const downHandler = () => {
      setSelectedIndex((selectedIndex + 1) % items.length)
    }

    const enterHandler = () => {
      const nextItem = items[selectedIndex]
      if (!nextItem) return
      selectItem(nextItem.pageId)
    }

    useEffect(() => setSelectedIndex(0), [items])
    useEffect(() => {
      activeRef.current?.scrollIntoView({block: 'nearest'})
    }, [activeRef.current])
    useImperativeHandle(ref, () => ({
      onKeyDown: ({event}: {event: React.KeyboardEvent}) => {
        if (event.key === 'ArrowUp') {
          upHandler()
          return true
        }

        if (event.key === 'ArrowDown') {
          downHandler()
          return true
        }

        if (event.key === 'Enter' || event.key === 'Tab') {
          enterHandler()
          return true
        }
        return false
      }
    }))

    return (
      <div className='z-10 max-h-56 in-data-[placement="bottom-start"]:animate-slide-down in-data-[placement="top-start"]:animate-slide-up overflow-auto rounded-md bg-white py-1 shadow-lg outline-hidden'>
        <div className='mx-1 px-3 py-1 font-semibold text-xs'>{'Select a page'}</div>
        {items.length === 0 && (
          <div className='mx-1 px-3 py-1 font-semibold text-slate-500 text-xs italic'>
            {'No pages found'}
          </div>
        )}
        {items.map((item) => (
          <div className='mx-1 flex' key={item.pageId}>
            <div
              ref={item === activeItem ? activeRef : undefined}
              data-highlighted={item === activeItem ? '' : undefined}
              className={
                'group flex w-full cursor-pointer items-center space-x-2 rounded-md px-3 py-2 text-slate-700 text-sm leading-8 outline-hidden hover:bg-slate-200! hover:text-slate-900 focus:bg-slate-200 data-highlighted:bg-slate-100 data-highlighted:text-slate-900'
              }
              onClick={() => selectItem(item.pageId)}
            >
              <span>{item.title}</span>
            </div>
          </div>
        ))}
      </div>
    )
  }
)
