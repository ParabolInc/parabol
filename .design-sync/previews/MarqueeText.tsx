import {MarqueeText} from 'parabol-client'

export const Default = () => (
  <div className='relative m-3 h-8 w-44 rounded bg-white'>
    <MarqueeText title='Improve CI pipeline' isExpanded={false} readOnly onActivateEdit={() => {}} />
  </div>
)

export const Overflowing = () => (
  <div className='relative m-3 h-8 w-44 rounded bg-white'>
    <MarqueeText
      title='Reduce flaky integration tests across the whole suite'
      isExpanded={false}
      readOnly
      onActivateEdit={() => {}}
    />
  </div>
)

export const Expanded = () => (
  <div className='relative m-3 h-8 w-44 rounded bg-grape-700 px-1'>
    <MarqueeText
      title='Onboarding wins'
      isExpanded
      readOnly
      onActivateEdit={() => {}}
    />
  </div>
)
