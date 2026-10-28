import {type NodeViewProps, NodeViewWrapper} from '@tiptap/react'
import {useCallback, useRef, useState} from 'react'
import {useBlockResizer} from '../../../hooks/useBlockResizer'
import {useSignInAndReturn} from '../../../hooks/useSignInAndReturn'
import {Button} from '../../../ui/Button/Button'
import {cn} from '../../../ui/cn'
import {useEmbedNewUserAsset} from '../fileBlock/useEmbedNewUserAsset'
import {BlockResizer} from './BlockResizer'
import type {ImageBlockAttrs} from './ImageBlock'
import {ImageBlockBubbleMenu} from './ImageBlockBubbleMenu'
import {ImageBlockPlaceholder} from './ImageBlockPlaceholder'

const NOTICES = {
  signIn: {
    title: 'Sign in to add images',
    description: "Others won't see this image until a signed-in editor adds it."
  },
  embedError: {
    title: "Image couldn't be embedded",
    description: 'The source requires authentication or is behind a firewall.'
  },
  external: {
    title: 'External image',
    description: "Images from other sites aren't loaded automatically."
  }
}

export const ImageBlockView = (props: NodeViewProps) => {
  const {editor, getPos, node, updateAttributes, selected} = props
  const imageWrapperRef = useRef<HTMLDivElement>(null)
  const {attrs} = node
  const {src, align, height, width, isFullWidth} = attrs as ImageBlockAttrs
  const alignClass =
    align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center'
  const {scopeKey, assetScope} = editor.extensionStorage.fileUpload
  const {isPending, embedError, isSignInRequired, isBlocked} = useEmbedNewUserAsset(
    src,
    scopeKey,
    assetScope,
    editor
  )
  const signIn = useSignInAndReturn()
  const onClick = useCallback(() => {
    const pos = getPos()
    if (!pos) return
    editor.chain().focus().setNodeSelection(pos).run()
  }, [getPos, editor])

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

  const notice = isSignInRequired
    ? NOTICES.signIn
    : embedError
      ? NOTICES.embedError
      : isBlocked
        ? NOTICES.external
        : null
  if (notice) {
    return (
      <NodeViewWrapper>
        <div className={cn('flex', alignClass)}>
          <ImageBlockPlaceholder
            src={src}
            onClick={onClick}
            title={notice.title}
            description={notice.description}
            action={
              isSignInRequired && (
                <Button
                  variant='outline'
                  size='sm'
                  className='mt-2'
                  onClick={(e) => {
                    e.stopPropagation()
                    signIn()
                  }}
                >
                  Sign in
                </Button>
              )
            }
          />
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
            data-uploading={isPending ? '' : undefined}
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
