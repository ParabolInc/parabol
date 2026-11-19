interface Props {
  orgName: string
}

const OrgAIAppsEmptyState = ({orgName}: Props) => (
  <div className='border-hairline border-t p-8 text-center text-sm'>
    <p className='m-0 font-semibold text-fg-primary'>
      No one has connected an app to {orgName} yet
    </p>
    <p className='m-0 text-fg-secondary'>
      Members add Parabol from Claude’s or ChatGPT’s app directory and pick this organization.
    </p>
  </div>
)

export default OrgAIAppsEmptyState
