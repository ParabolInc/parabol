import type * as React from 'react'
import {forwardRef, useEffect, useLayoutEffect, useRef, useState} from 'react'
import TextAreaAutoSize from 'react-textarea-autosize'
import {Edit} from '~/ui/icons'
import {cn} from '../ui/cn'
import type Legitity from '../validation/Legitity'

interface Props {
  autoFocus?: boolean
  className?: string
  disabled?: boolean
  error: string | undefined
  validate: (value: string) => Legitity
  handleSubmit: (value: string) => void
  hideIcon?: boolean
  isWrap?: boolean
  initialValue: string
  maxLength: number
  placeholder: string
  onEditingChange?: (isEditing: boolean) => void
}

const EditableText = forwardRef((props: Props, ref: React.Ref<HTMLDivElement>) => {
  const {
    initialValue,
    error,
    handleSubmit,
    maxLength,
    placeholder,
    validate,
    autoFocus: autoFocusProp,
    className,
    disabled,
    hideIcon,
    isWrap,
    onEditingChange
  } = props
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const [autoFocus, setAutoFocus] = useState(autoFocusProp)
  const [value, setValue] = useState(initialValue)
  const [inputWidth, setInputWidth] = useState(0)
  const spanRef = useRef<HTMLSpanElement>(null)

  const calculateWidth = () => {
    if (spanRef.current) {
      const width = spanRef.current.offsetWidth
      setInputWidth(width + 4)
    }
  }

  const setEditing = (isEditing: boolean) => {
    setIsEditing(isEditing)
    setAutoFocus(false)
    onEditingChange?.(isEditing)
  }

  useEffect(() => {
    if (isEditing) return
    setValue(initialValue)
  }, [initialValue])

  const showEditing = (error || isEditing || autoFocus) && !disabled

  useLayoutEffect(() => {
    calculateWidth()
  }, [value, showEditing])

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const nextValue = e.target.value || ''
    validate(nextValue)
    // make sure this is always true
    // repro: remove all text, blur input, focus input (with error present), then type a char
    setEditing(true)
    setValue(nextValue)
  }

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (value.toLowerCase().startsWith(placeholder.toLowerCase())) {
      e.target.select()
    }
    if (isWrap) {
      // hack to move caret to end
      // because it's 2020 and we still have to do stupid hacks like this >:-(
      const tmp = e.target.value
      e.target.value = ''
      e.target.value = tmp
    }
  }

  const onSubmit = async (e: React.FocusEvent | React.FormEvent) => {
    e.preventDefault()
    setEditing(false)
    if (value.trim() === initialValue.trim()) return
    handleSubmit(value)
  }

  const reset = () => {
    setEditing(false)
    setValue(initialValue)
    validate(initialValue)
    inputRef.current?.blur()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      // wait a tick so other escape listeners see that this is the active element
      setTimeout(reset)
    }
  }

  if (showEditing) {
    const commonProps = {
      autoFocus: true,
      maxLength,
      onBlur: onSubmit,
      onChange: onChange,
      onFocus: onFocus,
      onKeyDown: onKeyDown,
      placeholder,
      value,
      ref: inputRef as any
    }

    return (
      <div className={className} ref={ref}>
        <form
          className={cn(
            'relative m-0 items-center border-0 p-0',
            isWrap ? 'flex w-full' : 'inline-flex'
          )}
          onSubmit={onSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              onSubmit(e)
            }
          }}
        >
          {isWrap ? (
            <TextAreaAutoSize
              {...commonProps}
              className='block w-full resize-none border-0 bg-transparent p-0 text-fg-primary outline-none'
              maxRows={3}
              style={{width: undefined}}
            />
          ) : (
            <>
              <input
                {...commonProps}
                className='inline-block w-auto min-w-[50px] border-0 bg-transparent px-0.5 py-0 text-fg-primary outline-none'
                style={{width: !inputWidth ? 'auto' : `${inputWidth}px`}}
              />
              <span className='invisible absolute h-0 whitespace-pre' ref={spanRef}>
                {value || placeholder}
              </span>
            </>
          )}
          {error && <div className='text-[14px] text-fg-error'>{error}</div>}
        </form>
      </div>
    )
  }
  const showPlaceholder = !value && placeholder
  return (
    <div className={className} ref={ref}>
      <div
        className={cn(
          'inline-flex items-center gap-1 font-sans',
          disabled ? 'cursor-default outline-none' : 'cursor-pointer hover:opacity-50'
        )}
        role='button'
        tabIndex={0}
        onFocus={() => setEditing(true)}
        onPointerDown={(e) => {
          if (e.button !== 0) return
          e.preventDefault()
          setEditing(true)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setEditing(true)
          }
        }}
      >
        {showPlaceholder && <div className='text-fg-secondary'>{placeholder}</div>}
        {value && <div className='text-fg-primary'>{value}</div>}
        {!hideIcon && !disabled && <Edit className='ml-2 h-[18px] w-[18px] text-fg-secondary' />}
      </div>
    </div>
  )
})
export default EditableText
