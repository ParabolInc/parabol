import type {Editor} from '@tiptap/core'
import {Suspense, useState} from 'react'
import useQueryLoaderNow from '~/hooks/useQueryLoaderNow'
import type {ImageSelectorSearchTabQuery} from '../../../__generated__/ImageSelectorSearchTabQuery.graphql'
import imageSelectorSearchTabQuery from '../../../__generated__/ImageSelectorSearchTabQuery.graphql'
import {ImageSelectorSearchTab} from './ImageSelectorSearchTab'
interface Props {
  editor: Editor
  setImageURL: (url: string) => void
}

export const ImageSelectorSearchTabRoot = (props: Props) => {
  const {editor} = props
  const [searchQuery, setSearchQuery] = useState('')
  const queryToSendToServer = searchQuery.length > 2 ? searchQuery : ''
  const queryRef = useQueryLoaderNow<ImageSelectorSearchTabQuery>(
    imageSelectorSearchTabQuery,
    {
      fetchOriginal: editor.storage.imageUpload.editorWidth > 500,
      query: queryToSendToServer
    },
    undefined,
    true
  )

  return (
    <Suspense fallback={''}>
      {queryRef && (
        <ImageSelectorSearchTab
          {...props}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          queryRef={queryRef}
        />
      )}
    </Suspense>
  )
}
export default ImageSelectorSearchTabRoot
