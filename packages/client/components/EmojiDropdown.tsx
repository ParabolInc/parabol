import {MentionNodeAttrs} from '@tiptap/extension-mention'
import {SuggestionProps} from '@tiptap/suggestion'
import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react'
import TypeAheadLabel from './TypeAheadLabel'

export default forwardRef(
  (props: SuggestionProps<{id: string; native: string}, MentionNodeAttrs>, ref) => {
    const {items, query, editor, range} = props
    const [selectedIndex, setSelectedIndex] = useState(0)
    const activeRef = useRef<HTMLDivElement>(null)
    const selectItem = (idx: number) => {
      const item = items[idx]
      if (!item) return
      editor.commands.insertContentAt(range, item.native + ' ')
    }

    const upHandler = () => {
      setSelectedIndex((selectedIndex + items.length - 1) % items.length)
    }

    const downHandler = () => {
      setSelectedIndex((selectedIndex + 1) % items.length)
    }

    const enterHandler = () => {
      selectItem(selectedIndex)
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
    if (items.length === 0) return null
    return (
      <div className='border-rad z-10 max-h-56 overflow-auto rounded-md bg-white py-1 shadow-lg outline-hidden in-data-[placement="bottom-start"]:animate-slide-down in-data-[placement="top-start"]:animate-slide-up'>
        {items.map((item, idx) => {
          const isActive = idx === selectedIndex
          return (
            <div
              ref={isActive ? activeRef : undefined}
              data-highlighted={isActive ? '' : undefined}
              className={
                'flex w-full cursor-pointer items-center rounded-md px-4 py-1 text-sm leading-8 text-slate-700 outline-hidden hover:bg-slate-200! hover:text-slate-900 focus:bg-slate-200 data-highlighted:bg-slate-100 data-highlighted:text-slate-900'
              }
              key={item.id}
              onClick={() => selectItem(idx)}
            >
              <span>{item.native}</span>
              <TypeAheadLabel label={`:${item.id}:`} query={query} className='pl-3' />
            </div>
          )
        })}
      </div>
    )
  }
)
