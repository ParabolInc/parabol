import {SuggestionProps} from '@tiptap/suggestion'
import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react'

export const PageLinkMenu = forwardRef(
  (props: SuggestionProps<{pageId: string; title: string}>, ref) => {
    const {editor, items} = props
    const [selectedIndex, setSelectedIndex] = useState(0)
    const activeRef = useRef<HTMLDivElement>(null)
    const activeItem = items[selectedIndex]
    const selectItem = (title: string) => {
      const item = items.find((item) => item.title === title)
      if (!item) return
      const {pageId} = item
      console.log({pageId})
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
      selectItem(nextItem.title)
    }

    useEffect(() => setSelectedIndex(0), [items])
    useEffect(() => {
      activeRef.current?.scrollIntoView({block: 'nearest'})
    }, [activeRef.current])
    useEffect(() => {
      return () => {
        console.log('closing from compnent useEffect')
        editor.emit('pageLinkPicker', {willOpen: false})
      }
    }, [])
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

    if (!items.length) return null
    return (
      <div
        key={'pfjdf'}
        className='z-10 max-h-56 overflow-auto rounded-md bg-white py-1 shadow-lg outline-hidden in-data-[placement="bottom-start"]:animate-slide-down in-data-[placement="top-start"]:animate-slide-up'
      >
        <div className='mx-1 px-3 py-1 text-xs font-semibold'>{'Select a page'}</div>
        {items.map((item) => (
          <div className='mx-1 flex' key={item.title}>
            <div
              ref={item === activeItem ? activeRef : undefined}
              data-highlighted={item === activeItem ? '' : undefined}
              className={
                'group flex w-full cursor-pointer items-center space-x-2 rounded-md px-3 py-2 text-sm leading-8 text-slate-700 outline-hidden hover:bg-slate-200! hover:text-slate-900 focus:bg-slate-200 data-highlighted:bg-slate-100 data-highlighted:text-slate-900'
              }
              onClick={() => selectItem(item.title)}
            >
              <span>{item.title}</span>
            </div>
          </div>
        ))}
      </div>
    )
  }
)
