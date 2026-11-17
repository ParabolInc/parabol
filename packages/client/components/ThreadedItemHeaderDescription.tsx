import type {ReactNode} from 'react'

interface Props {
  children?: ReactNode
  title: string
  subTitle: string
}

const ThreadedItemHeaderDescription = (props: Props) => {
  const {children, title, subTitle} = props
  return (
    <div className='flex w-full justify-between pt-1 text-xs leading-3'>
      <div className='flex flex-wrap items-center'>
        <div className='max-w-[200px] overflow-hidden text-ellipsis font-semibold text-fg-primary'>
          {title}
        </div>
        <div className='whitespace-pre-wrap text-fg-secondary'> {subTitle}</div>
      </div>
      {children}
    </div>
  )
}

export default ThreadedItemHeaderDescription
