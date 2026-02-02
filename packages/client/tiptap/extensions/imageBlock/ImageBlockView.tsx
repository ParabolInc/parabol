import {type NodeViewProps, NodeViewWrapper} from '@tiptap/react'
import {useCallback, useEffect, useRef, useState} from 'react'
import useAtmosphere from '~/hooks/useAtmosphere'
import {useEmbedUserAsset} from '~/mutations/useEmbedUserAsset'
import {useBlockResizer} from '../../../hooks/useBlockResizer'
import {cn} from '../../../ui/cn'
import {useEmbedNewUserAsset} from '../fileBlock/useEmbedNewUserAsset'
import {BlockResizer} from './BlockResizer'
import type {ImageBlockAttrs} from './ImageBlock'
import {ImageBlockBubbleMenu} from './ImageBlockBubbleMenu'

export const ImageBlockView = (props: NodeViewProps) => {
  const {editor, getPos, node, updateAttributes} = props
  const imageWrapperRef = useRef<HTMLDivElement>(null)
  const {attrs} = node
  const {src, align, height, width} = attrs as ImageBlockAttrs
  const alignClass =
    align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center'
  const {scopeKey, assetScope} = editor.extensionStorage.fileUpload
  const {isHosted} = useEmbedNewUserAsset(src, scopeKey, assetScope, updateAttributes)
  const onClick = useCallback(() => {
    const pos = getPos()
    if (!pos) return
    editor.commands.setNodeSelection(pos)
  }, [getPos, editor.commands])

  const [maxHeight, setMaxHeight] = useState(
    // if no height is provided (first load), make sure the image is no taller than the editor
    height ? undefined : editor.storage.imageBlock.editorHeight
  )

  const aspectRatioRef = useRef(1)
  const {onMouseDown} = useBlockResizer(
    width,
    updateAttributes,
    aspectRatioRef,
    editor.storage.imageBlock.editorWidth
  )
  const onMouseDownLeft = onMouseDown('left')
  const onMouseDownRight = onMouseDown('right')
  const atmosphere = useAtmosphere()
  const [commit] = useEmbedUserAsset()
  useEffect(() => {
    if (isHosted) return
    commit({
      variables: {url: src, scope: assetScope, scopeKey},
      onCompleted: (res, error) => {
        const {embedUserAsset} = res
        if (!embedUserAsset) {
          // Since this is triggered without user input, we log it silently
          console.error(error?.[0]?.message)
          return
        }
        const {url} = embedUserAsset
        const message = embedUserAsset?.error?.message
        if (message) {
          atmosphere.eventEmitter.emit('addSnackbar', {
            key: 'errorEmbeddingAsset',
            message,
            autoDismiss: 5
          })
          return
        }
        updateAttributes({src: url})
      }
    })
  }, [isHosted])
  return (
    <NodeViewWrapper>
      <div className={cn('flex', alignClass)}>
        <div contentEditable={false} ref={imageWrapperRef} className='group relative w-fit'>
          <img
            draggable={false}
            data-uploading={isHosted ? undefined : ''}
            className='block data-uploading:animate-shimmer data-uploading:[mask:linear-gradient(-60deg,#000_30%,#0005,#000_70%)_right/350%_100%]'
            src={src}
            alt=''
            onClick={onClick}
            style={{maxHeight}}
            width={width}
            height={height}
            onLoad={(e) => {
              const img = e.target as HTMLImageElement
              aspectRatioRef.current = img.width / img.height
              if (img.width !== width) {
                // on initial load, once we grab the h/w/ar, remove the maxH constraint
                setMaxHeight(undefined)
                updateAttributes({width: img.width, height: img.height})
              }
            }}
          />
          {editor.isEditable && (
            <>
              <BlockResizer className='left-0' onMouseDown={onMouseDownLeft} />
              <BlockResizer className='right-0' onMouseDown={onMouseDownRight} />
              <ImageBlockBubbleMenu
                align={align}
                updateAttributes={updateAttributes}
                width={width}
              />
            </>
          )}
        </div>
      </div>
    </NodeViewWrapper>
  )
}

export default ImageBlockView
