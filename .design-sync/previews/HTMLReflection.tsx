import {HTMLReflection} from 'parabol-client'

export const Default = () => (
  <div className='w-64 rounded-lg bg-white py-1 shadow'>
    <HTMLReflection
      html='<p>We paired on the tricky data migration and it went smoothly.</p>'
      disableAnonymity={false}
    />
  </div>
)

export const WithList = () => (
  <div className='w-64 rounded-lg bg-white py-1 shadow'>
    <HTMLReflection
      html='<p>A few things slowed us down:</p><ul><li>Flaky CI tests</li><li>Late design handoff</li></ul>'
      disableAnonymity={false}
    />
  </div>
)
