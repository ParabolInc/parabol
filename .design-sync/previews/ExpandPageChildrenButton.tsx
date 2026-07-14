import {ExpandPageChildrenButton} from 'parabol-client'

const Row = ({children, title}: {children: React.ReactNode; title: string}) => (
  <div className='group flex w-64 items-center gap-2 rounded-md bg-slate-200 px-2 py-1'>
    {children}
    <span className='text-slate-700 text-sm'>{title}</span>
  </div>
)

export const Page = () => (
  <Row title='Product Roadmap'>
    <ExpandPageChildrenButton
      expandChildPages={() => {}}
      showChildren={false}
      draggingPageId={null}
    />
  </Row>
)

export const Emoji = () => (
  <Row title='Team Charter'>
    <ExpandPageChildrenButton
      expandChildPages={() => {}}
      showChildren={false}
      draggingPageId={null}
      emoji='📋'
    />
  </Row>
)

export const Expanded = () => (
  <Row title='Engineering Wiki'>
    <ExpandPageChildrenButton
      expandChildPages={() => {}}
      showChildren={true}
      draggingPageId={null}
    />
  </Row>
)
