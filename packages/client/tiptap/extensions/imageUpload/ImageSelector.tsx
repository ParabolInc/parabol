import type {Editor} from '@tiptap/core'
import {useState} from 'react'
import Tab from '../../../components/Tab/Tab'
import Tabs from '../../../components/Tabs/Tabs'
import {ImageSelectorUploadTab} from './ImageSelectorUploadTab'

interface Props {
  editor: Editor
}

const tabs = [
  {
    id: 'upload',
    label: 'Upload',
    Component: ImageSelectorUploadTab
  },
  {
    id: 'embedLink',
    label: 'Embed link',
    Component: ImageSelectorUploadTab
  },
  {
    id: 'addGif',
    label: 'Add Gif',
    Component: ImageSelectorUploadTab
  }
] as const

export const ImageSelector = (props: Props) => {
  const {editor} = props
  const [activeIdx, setActiveIdx] = useState(0)
  const {Component} = tabs[activeIdx]!
  const setImageURL = (url: string) => {
    const {from} = editor.state.selection
    editor.chain().setImageBlock({src: url}).deleteRange({from, to: from}).focus().run()
  }
  return (
    <div className='min-w-44 rounded-md bg-slate-100 p-2'>
      <Tabs activeIdx={activeIdx}>
        {tabs.map((tab, idx) => (
          <Tab
            key={tab.label}
            onClick={() => {
              setActiveIdx(idx)
            }}
            className='whitespace-nowrap px-2 py-0'
            label={
              <div className='flex items-center justify-center text-sm font-normal'>
                {tab.label}
              </div>
            }
          />
        ))}
      </Tabs>
      <Component setImageURL={setImageURL} />
    </div>
  )
}
