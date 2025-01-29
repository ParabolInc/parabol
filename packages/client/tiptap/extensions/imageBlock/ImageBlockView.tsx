import {NodeViewWrapper, type NodeViewProps} from '@tiptap/react'
import {useCallback, useEffect, useRef, useState} from 'react'
import {useBlockResizer} from '../../../hooks/useBlockResizer'
import {cn} from '../../../ui/cn'
import {BlockResizer} from './BlockResizer'
import {ImageBlockBubbleMenu} from './ImageBlockBubbleMenu'
export const ImageBlockView = (props: NodeViewProps) => {
  const {editor, getPos, node, updateAttributes} = props
  const imageWrapperRef = useRef<HTMLDivElement>(null)
  const {src, align} = node.attrs

  const alignClass =
    align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center'

  const onClick = useCallback(() => {
    editor.commands.setNodeSelection(getPos())
  }, [getPos, editor.commands])

  const maxHeightRef = useRef<number | undefined>(editor.storage.imageUpload.editorHeight)
  const {current: maxHeight} = maxHeightRef
  const aspectRatioRef = useRef(0)
  const ref = useRef<HTMLImageElement>(null)
  const [width, setWidth] = useState<number>(node.attrs.width || 0)
  const {onMouseDown} = useBlockResizer(width, setWidth, updateAttributes, aspectRatioRef)
  const onMouseDownLeft = onMouseDown('left')
  const onMouseDownRight = onMouseDown('right')
  useEffect(() => {
    if (width === node.attrs.width) return
    // the attributes will change if another instance (e.g. a reflection in an expanded stack) edits them
    setWidth(node.attrs.width)
  }, [node.attrs.width])
  return (
    <NodeViewWrapper>
      <div className={cn('flex', alignClass)}>
        <div contentEditable={false} ref={imageWrapperRef} className='group relative w-fit'>
          <img
            className='block'
            src={src}
            alt=''
            onClick={onClick}
            style={{maxHeight, width: width === 0 ? undefined : width}}
            ref={ref}
            onLoad={(e) => {
              const img = e.target as HTMLImageElement
              console.log('loaded', img.width, img.height, maxHeightRef.current)
              maxHeightRef.current = undefined
              aspectRatioRef.current = img.width / img.height
              if (img.width !== node.attrs.width) {
                setWidth(img.width)
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
