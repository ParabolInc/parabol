import {CopyServiceProviderURL} from 'parabol-client'

// FLOOR CARD: the component renders a Radix Tooltip (parabol's `Tooltip` re-exports
// Radix `Root`), which throws "`Tooltip` must be used within `TooltipProvider`"
// when no provider ancestor exists. @radix-ui/react-tooltip is privately bundled
// inside the parabol-client DS bundle, so a TooltipProvider imported into this
// preview is a different module copy and cannot satisfy it. Blanks. See learnings.
export const SSOLoginURL = () => (
  <div className='grid w-[560px] grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 rounded bg-white p-4 text-slate-700 text-sm'>
    <CopyServiceProviderURL
      label='SSO Login URL'
      url='https://action.parabol.co/sso/saml/acme-corp'
    />
  </div>
)
