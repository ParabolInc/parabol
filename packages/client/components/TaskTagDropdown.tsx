import {MentionNodeAttrs} from '@tiptap/extension-mention'
import {SuggestionProps} from '@tiptap/suggestion'
import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react'
import TypeAheadLabel from './TypeAheadLabel'

export const TaskTagDropdown = forwardRef(
  (props: SuggestionProps<{id: string; label: string}, MentionNodeAttrs>, ref) => {
    const {command, items, query} = props
    const [selectedIndex, setSelectedIndex] = useState(0)
    const activeRef = useRef<HTMLDivElement>(null)
    const selectItem = (idx: number) => {
      const item = items[idx]
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
      selectItem(selectedIndex)
    }

    useEffect(() => setSelectedIndex(0), [items])

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
      <div className='border-rad z-10 max-h-56 overflow-auto rounded-md bg-white py-1 shadow-lg outline-none [[data-placement="bottom-start"]_&]:animate-slideDown [[data-placement="top-start"]_&]:animate-slideUp'>
        {items.length ? (
          items.map((item, idx) => {
            const isActive = idx === selectedIndex
            return (
              <div
                ref={isActive ? activeRef : undefined}
                data-highlighted={isActive}
                className={
                  'flex w-full flex-shrink-0 cursor-pointer items-center rounded-md px-2 py-1 text-sm leading-8 text-slate-700 outline-none hover:!bg-slate-200 hover:text-slate-900 focus:bg-slate-200 data-highlighted:bg-slate-100 data-highlighted:text-slate-900'
                }
                key={item.id}
                onClick={() => selectItem(idx)}
              >
                <TypeAheadLabel
                  label={item.id}
                  query={query}
                  className='min-w-20 font-bold'
                  highlight
                />
                <span className='flex justify-start pl-3'>{item.label}</span>
              </div>
            )
          })
        ) : (
          <div></div>
        )}
      </div>
    )
  }
)
