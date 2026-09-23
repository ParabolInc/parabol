import {cn} from '../../../ui/cn'

interface Options {
  isPhone: boolean
  isFocusedBlock: boolean
  isFocused: boolean
  compact: boolean
}

const answerEditorClassName = (options: Options) => {
  const {isPhone, isFocusedBlock, isFocused, compact} = options
  if (isPhone)
    return cn(
      'overflow-auto p-3 text-base leading-6',
      isFocusedBlock ? 'min-h-0 flex-1 [&>.ProseMirror]:min-h-full' : 'min-h-[72px]'
    )
  return cn(
    'max-h-[280px] overflow-auto p-[10px_12px_6px] text-sm leading-6',
    compact
      ? isFocused
        ? 'min-h-[160px]'
        : 'min-h-[120px]'
      : isFocused
        ? 'min-h-[112px]'
        : 'min-h-[88px]'
  )
}

export default answerEditorClassName
