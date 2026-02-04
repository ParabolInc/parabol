import type {Editor} from '@tiptap/core'
import {useState} from 'react'
import Tab from '../../../components/Tab/Tab'
import Tabs from '../../../components/Tabs/Tabs'
import type {FileUploadTargetType} from '../../../shared/tiptap/extensions/FileUploadBase'
import {FileSelectorEmbedTab} from './FileSelectorEmbedTab'
import {FileSelectorUploadTab} from './FileSelectorUploadTab'
import ImageSelectorSearchTabRoot from './ImageSelectorSearchTabRoot'

interface Props {
  editor: Editor
  targetType: FileUploadTargetType
}

const tabs = [
  {
    id: 'upload',
    label: 'Upload',
    Component: FileSelectorUploadTab,
    isVisible: true,
    targetType: undefined
  },
  {
    id: 'embedLink',
    label: 'Embed link',
    Component: FileSelectorEmbedTab,
    isVisible: true,
    targetType: undefined
  },
  {
    id: 'addGif',
    label: 'Add Gif',
    Component: ImageSelectorSearchTabRoot,
    isVisible: !!window.__ACTION__?.GIF_PROVIDER,
    targetType: 'image'
  }
] as const

export const FileSelector = (props: Props) => {
  const {editor, targetType} = props
  const [activeIdx, setActiveIdx] = useState(0)
  const {Component} = tabs[activeIdx]!
  return (
    <div className='flex h-full min-w-44 flex-col overflow-hidden rounded-md bg-slate-100 p-2'>
      <Tabs activeIdx={activeIdx} className='max-w-sm'>
        {tabs
          .filter(
            (tab) =>
              tab.isVisible && (tab.targetType === undefined || tab.targetType === targetType)
          )
          .map((tab, idx) => (
            <Tab
              key={tab.label}
              onClick={() => {
                setActiveIdx(idx)
              }}
              className='whitespace-nowrap px-2 py-0'
              label={
                <div className='flex items-center justify-center font-normal text-sm'>
                  {tab.label}
                </div>
              }
            />
          ))}
      </Tabs>
      <Component editor={editor} targetType={targetType} />
    </div>
  )
}
