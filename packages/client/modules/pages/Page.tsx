import type {useTipTapPageEditor_viewer$key} from '../../__generated__/useTipTapPageEditor_viewer.graphql'
import {TipTapEditor} from '../../components/promptResponse/TipTapEditor'
import useRouter from '../../hooks/useRouter'
import {useTipTapPageEditor} from '../../hooks/useTipTapPageEditor'

interface Props {
  viewerRef: useTipTapPageEditor_viewer$key | null
}

export const Page = (props: Props) => {
  const {viewerRef} = props
  const {match} = useRouter<{orgName: string; pageSlug: string}>()
  const {params} = match
  const {pageSlug} = params
  const pageIdIdx = pageSlug.lastIndexOf('-')
  const pageId = Number(pageIdIdx === -1 ? pageSlug : pageSlug.slice(pageIdIdx + 1))
  const {editor} = useTipTapPageEditor(pageId, {viewerRef})
  if (!editor) return <div>No editor</div>
  if (!pageSlug) return <div>No page ID provided in route</div>
  return (
    <div className='tems-center flex h-full w-full justify-center bg-slate-200 pt-2'>
      <div className='flex w-full max-w-[960px] justify-center bg-white pt-28'>
        <TipTapEditor editor={editor} className='flex h-full w-full' />
      </div>
    </div>
  )
}

export default Page
