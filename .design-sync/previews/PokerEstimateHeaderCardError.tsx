import {PokerEstimateHeaderCardError} from 'parabol-client'

// FLOOR CARD: the delete affordance is wrapped in a Radix Tooltip (parabol's
// `Tooltip` re-exports Radix `Root`), which throws "`Tooltip` must be used within
// `TooltipProvider`" without a provider ancestor. @radix-ui/react-tooltip is
// privately bundled inside the parabol-client DS bundle, so a TooltipProvider
// imported here is a different module copy and cannot satisfy it. Blanks.
export const ServiceDown = () => (
  <div className='w-[600px] bg-slate-200 py-4'>
    <PokerEstimateHeaderCardError service='jira' onRemove={() => {}} />
  </div>
)
