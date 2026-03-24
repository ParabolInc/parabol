import BrokenImageIcon from '@mui/icons-material/BrokenImage'
import {type NodeViewProps, NodeViewWrapper} from '@tiptap/react'
import {useCallback, useRef, useState} from 'react'
import {useBlockResizer} from '../../../hooks/useBlockResizer'
import {cn} from '../../../ui/cn'
import {useEmbedNewUserAsset} from '../fileBlock/useEmbedNewUserAsset'
import {BlockResizer} from './BlockResizer'
import type {ImageBlockAttrs} from './ImageBlock'
import {ImageBlockBubbleMenu} from './ImageBlockBubbleMenu'

export const ImageBlockView = (props: NodeViewProps) => {
  const {editor, getPos, node, updateAttributes, selected} = props
  const imageWrapperRef = useRef<HTMLDivElement>(null)
  const {attrs} = node
  const {src, align, height, width, isFullWidth} = attrs as ImageBlockAttrs
  const alignClass =
    align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center'
  const {scopeKey, assetScope} = editor.extensionStorage.fileUpload
  const {isHosted, embedError} = useEmbedNewUserAsset(src, scopeKey, assetScope, editor)
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
    (attrs) => updateAttributes({...attrs, isFullWidth: false}),
    aspectRatioRef,
    editor.view.dom.getBoundingClientRect().width || editor.storage.imageBlock.editorWidth
  )
  const onMouseDownLeft = onMouseDown('left')
  const onMouseDownRight = onMouseDown('right')

  const isLoading = !isHosted && !embedError

  if (embedError) {
    let displayUrl = src
    try {
      const parsed = new URL(src)
      displayUrl = parsed.hostname + parsed.pathname
    } catch {
      // keep raw src
    }
    const isSafeUrl = /^https?:\/\//i.test(src)
    return (
      <NodeViewWrapper>
        <div className={cn('flex', alignClass)}>
          <div
            contentEditable={false}
            onClick={onClick}
            className='w-full rounded-md border border-slate-200 bg-slate-50 px-4 py-3'
          >
            <div className='flex items-start gap-3'>
              <div className='flex size-10 shrink-0 items-center justify-center rounded-md bg-slate-200'>
                <BrokenImageIcon className='size-5 text-slate-500' />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='font-medium text-slate-700 text-sm'>Image couldn't be embedded</p>
                <p className='mt-0.5 text-slate-500 text-xs'>
                  The source requires authentication or is behind a firewall.
                </p>
                {isSafeUrl ? (
                  <a
                    href={src}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='mt-1 block truncate text-blue-600 text-xs underline decoration-blue-300 hover:text-blue-700'
                    onClick={(e) => e.stopPropagation()}
                  >
                    {displayUrl}
                  </a>
                ) : (
                  <span className='mt-1 block truncate text-slate-500 text-xs'>{displayUrl}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper>
      <div className={cn('flex', alignClass)}>
        <div
          contentEditable={false}
          ref={imageWrapperRef}
          className={cn('group relative', isFullWidth ? 'w-full' : 'w-fit')}
        >
          <img
            draggable={false}
            data-uploading={isLoading ? '' : undefined}
            className='block data-uploading:animate-shimmer data-uploading:[mask:linear-gradient(-60deg,#000_30%,#0005,#000_70%)_right/350%_100%]'
            src={src}
            alt=''
            onClick={onClick}
            style={{maxHeight: isFullWidth ? undefined : maxHeight}}
            width={isFullWidth ? '100%' : width}
            height={isFullWidth ? undefined : height}
            onLoad={(e) => {
              const img = e.target as HTMLImageElement
              aspectRatioRef.current = img.width / img.height
              if (img.width !== width && !isFullWidth) {
                // on initial load, once we grab the h/w/ar, remove the maxH constraint
                setMaxHeight(undefined)
                updateAttributes({width: img.width, height: img.height})
              }
            }}
          />
          {editor.isEditable && (
            <>
              {!isFullWidth && (
                <>
                  <BlockResizer className='left-0' onMouseDown={onMouseDownLeft} />
                  <BlockResizer className='right-0' onMouseDown={onMouseDownRight} />
                </>
              )}
              <ImageBlockBubbleMenu
                editor={editor}
                align={align}
                updateAttributes={updateAttributes}
                width={width}
                isFullWidth={isFullWidth}
                isOpen={selected}
              />
            </>
          )}
        </div>
      </div>
    </NodeViewWrapper>
  )
}

export default ImageBlockView
