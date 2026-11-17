import {forwardRef, type ReactNode, type Ref} from 'react'

interface Props {
  children: ReactNode
}

const ReflectWrapperDesktop = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  const {children} = props
  return (
    // if the viewport is wide enough for 2+ columns, let them scroll
    <div className='flex h-full w-full overflow-x-auto'>
      <div className='mx-auto flex justify-center' ref={ref}>
        {children}
      </div>
    </div>
  )
})

export default ReflectWrapperDesktop
