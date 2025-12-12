import {type NodeViewProps, NodeViewWrapper} from '@tiptap/react'
import {useCallback, useEffect, useRef, useState} from 'react'
import {useBlockResizer} from '../../../hooks/useBlockResizer'
import {cn} from '../../../ui/cn'
import {BlockResizer} from './BlockResizer'
import {ImageBlockBubbleMenu} from './ImageBlockBubbleMenu'
export const ImageBlockView = (props: NodeViewProps) => {
  const {editor, getPos, node, updateAttributes, selected} = props
  const imageWrapperRef = useRef<HTMLDivElement>(null)
  const {attrs} = node
  const {src, align, height, width, isFullWidth} = attrs
  const alignClass =
    align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center'

  // Handle opportunistic uploads
  useEffect(() => {
    const pendingUpload = editor.storage.imageUpload.pendingUploads.get(src)
    if (pendingUpload) {
      pendingUpload.then((url) => {
        updateAttributes({src: url})
        editor.storage.imageUpload.pendingUploads.delete(src)
      })
    }
  }, [src, editor.storage.imageUpload.pendingUploads, updateAttributes])

  const onClick = useCallback(() => {
    const pos = getPos()
    if (!pos) return
    editor.commands.setNodeSelection(pos)
  }, [getPos, editor.commands])

  const [maxHeight, setMaxHeight] = useState(
    // if no height is provided (first load), make sure the image is no taller than the editor
    height ? undefined : editor.storage.imageUpload.editorHeight
  )

  const aspectRatioRef = useRef(1)
  const {onMouseDown} = useBlockResizer(
    width,
    (attrs) => updateAttributes({...attrs, isFullWidth: false}),
    aspectRatioRef,
    editor.view.dom.getBoundingClientRect().width || editor.storage.imageUpload.editorWidth
  )
  const onMouseDownLeft = onMouseDown('left')
  const onMouseDownRight = onMouseDown('right')

  const [currentWidth, setCurrentWidth] = useState(width)

  useEffect(() => {
    if (!imageWrapperRef.current) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setCurrentWidth(entry.contentRect.width)
      }
    })
    observer.observe(imageWrapperRef.current)
    return () => observer.disconnect()
  }, [])

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
            className='block'
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
                width={currentWidth || width}
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
