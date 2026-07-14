import {PokerEstimateHeaderCardReadonly} from 'parabol-client'

export const StoryDescription = () => (
  <div className='w-[600px] rounded bg-white p-4 shadow'>
    <h1 className='mb-2 text-base text-slate-900'>Add SSO login</h1>
    <PokerEstimateHeaderCardReadonly
      descriptionHTML={
        '<p>As an admin, I want to sign in with our identity provider so that access is centrally managed.</p><ul><li>Support SAML 2.0</li><li>Support SCIM user provisioning</li></ul>'
      }
    />
  </div>
)

export const ShortDescription = () => (
  <div className='w-[600px] rounded bg-white p-4 shadow'>
    <h1 className='mb-2 text-base text-slate-900'>Fix flaky retro timer</h1>
    <PokerEstimateHeaderCardReadonly
      descriptionHTML={
        '<p>The meeting timer occasionally drifts by a few seconds after the tab is backgrounded.</p>'
      }
    />
  </div>
)
