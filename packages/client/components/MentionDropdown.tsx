import {MentionNodeAttrs} from '@tiptap/extension-mention'
import {SuggestionProps} from '@tiptap/suggestion'
import React, {forwardRef, useEffect, useImperativeHandle, useState} from 'react'
import Avatar from './Avatar/Avatar'
import TypeAheadLabel from './TypeAheadLabel'

export default forwardRef(
  (
    props: SuggestionProps<
      {userId: string; preferredName: string; picture: string},
      MentionNodeAttrs
    >,
    ref
  ) => {
    const {command, items, query} = props
    const [selectedIndex, setSelectedIndex] = useState(0)
    const selectItem = (idx: number) => {
      const item = items[idx]
      if (!item) return
      command({id: item.userId, label: item.preferredName})
    }

    const upHandler = () => {
      setSelectedIndex((selectedIndex + items.length - 1) % items.length)
    }

    const downHandler = () => {
      setSelectedIndex((selectedIndex + 1) % items.length)
    }

    const enterHandler = () => {
      selectItem(selectedIndex)

      if (items.length === 0) return false
      return true
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
          return enterHandler()
        }
        return false
      }
    }))
    if (items.length === 0) return null
    return (
      <div className='border-rad z-10 rounded-md bg-white py-1 shadow-lg outline-hidden in-data-[placement="bottom-start"]:animate-slide-down in-data-[placement="top-start"]:animate-slide-up'>
        {items.map((item, idx) => (
          <div
            data-highlighted={idx === selectedIndex ? '' : undefined}
            className={
              'flex w-full cursor-pointer items-center rounded-md px-4 py-1 text-sm leading-8 text-slate-700 outline-hidden hover:bg-slate-200! hover:text-slate-900 focus:bg-slate-200 data-highlighted:bg-slate-100 data-highlighted:text-slate-900'
            }
            key={item.userId}
            onClick={() => selectItem(idx)}
          >
            <Avatar picture={item.picture} className='h-6 w-6' />
            <TypeAheadLabel label={item.preferredName} query={query} className='pl-3' />
          </div>
        ))}
      </div>
    )
  }
)
