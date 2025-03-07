import type {Editor} from '@tiptap/core'
import {useState} from 'react'
import Tab from '../../../components/Tab/Tab'
import Tabs from '../../../components/Tabs/Tabs'
import {ImageSelectorEmbedTab} from './ImageSelectorEmbedTab'
import ImageSelectorSearchTabRoot from './ImageSelectorSearchTabRoot'
import {ImageSelectorUploadTab} from './ImageSelectorUploadTab'

interface Props {
  editor: Editor
}

const tabs = [
  {
    id: 'upload',
    label: 'Upload',
    Component: ImageSelectorUploadTab,
    isVisible: true
  },
  {
    id: 'embedLink',
    label: 'Embed link',
    Component: ImageSelectorEmbedTab,
    isVisible: true
  },
  {
    id: 'addGif',
    label: 'Add Gif',
    Component: ImageSelectorSearchTabRoot,
    isVisible: !!window.__ACTION__.GIF_PROVIDER
  }
] as const

export const ImageSelector = (props: Props) => {
  const {editor} = props
  const [activeIdx, setActiveIdx] = useState(0)
  const {Component} = tabs[activeIdx]!
  const setImageURL = (url: string) => {
    const {to} = editor.state.selection
    const size = editor.state.doc.content.size
    let command = editor.chain().focus().setImageBlock({src: url})
    if (size - to <= 1) {
      // if we're at the end of the doc, add an extra paragraph to make it easier to click below
      command = command.insertContent('<p></p>').setTextSelection(editor.state.selection.to + 1)
    }
    command.scrollIntoView().run()
  }
  return (
    <div className='flex h-full min-w-44 flex-col overflow-hidden rounded-md bg-slate-100 p-2'>
      <Tabs activeIdx={activeIdx} className='max-w-sm'>
        {tabs
          .filter((tab) => tab.isVisible)
          .map((tab, idx) => (
            <Tab
              key={tab.label}
              onClick={() => {
                setActiveIdx(idx)
              }}
              className='px-2 py-0 whitespace-nowrap'
              label={
                <div className='flex items-center justify-center text-sm font-normal'>
                  {tab.label}
                </div>
              }
            />
          ))}
      </Tabs>
      <Component setImageURL={setImageURL} editor={editor} />
    </div>
  )
}
