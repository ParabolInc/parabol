import {TipTapEditor} from '../../components/promptResponse/TipTapEditor'
import {useTipTapPageEditor} from '../../hooks/useTipTapPageEditor'

interface Props {}

export const Page = (_props: Props) => {
  const {editor} = useTipTapPageEditor('""', {})
  if (!editor) return null
  return (
    <div className='flex w-full items-center justify-center bg-slate-200'>
      <div className='flex w-full max-w-[960px] justify-center'>
        <TipTapEditor editor={editor} />
      </div>
    </div>
  )
}

export default Page
