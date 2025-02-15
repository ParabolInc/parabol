import {TipTapEditor} from '../../components/promptResponse/TipTapEditor'
import useRouter from '../../hooks/useRouter'
import {useTipTapPageEditor} from '../../hooks/useTipTapPageEditor'

interface Props {}

export const Page = (_props: Props) => {
  const {match} = useRouter<{orgName: string; pageId: number}>()
  const {params} = match
  const {pageId} = params
  const {editor} = useTipTapPageEditor(pageId, {})
  if (!editor) return null
  if (!pageId) return <div>No page ID provided in route</div>
  return (
    <div className='tems-center flex h-full w-full justify-center bg-slate-200 pt-2'>
      <div className='flex w-full max-w-[960px] justify-center bg-white pt-28'>
        <TipTapEditor editor={editor} className='flex h-full w-full' />
      </div>
    </div>
  )
}

export default Page
