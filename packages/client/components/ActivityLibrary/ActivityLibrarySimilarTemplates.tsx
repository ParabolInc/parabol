import type {ActivityGrid_user$key} from '../../__generated__/ActivityGrid_user.graphql'
import ActivityGrid from './ActivityGrid'
import type {Template} from './ActivityLibrary'

interface Props {
  templates: Template[]
  selectedCategory: string
  viewerRef: ActivityGrid_user$key
}

const ActivityLibrarySimilarTemplates = (props: Props) => {
  const {templates, selectedCategory, viewerRef} = props
  if (templates.length === 0) return null
  return (
    <>
      <div className='mt-8 ml-4 font-bold text-fg-primary text-xl'>Similar activities</div>
      <div className='mt-1 grid auto-rows-fr grid-cols-[repeat(auto-fill,minmax(min(40%,256px),1fr))] gap-4 px-4 md:mt-4'>
        <ActivityGrid
          templates={templates}
          selectedCategory={selectedCategory}
          viewerRef={viewerRef}
        />
      </div>
    </>
  )
}

export default ActivityLibrarySimilarTemplates
