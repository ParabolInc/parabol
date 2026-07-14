// NOTE: Radix `Tooltip` (Root) throws "must be used within `TooltipProvider`",
// and TooltipProvider is not exported from parabol-client — so the live
// component can't mount in isolation here. This renders a faithful static
// representation of the tooltip (same paletteV3 classes TooltipContent uses:
// bg-slate-700 / text-white / text-xs / rounded-xs). See
// .design-sync/learnings/primitives.md for the provider override the harness
// needs to render the real component.

const Tip = ({label, hint}: {label: string; hint: string}) => (
  <div className='flex flex-col items-center gap-2'>
    <div className='relative rounded-xs bg-slate-700 px-2 py-1 text-center font-bold text-white text-xs'>
      {hint}
      <div className='-bottom-1 -translate-x-1/2 absolute left-1/2 h-2 w-2 rotate-45 bg-slate-700' />
    </div>
    <button className='rounded-md bg-sky-500 px-3 py-2 font-semibold text-sm text-white'>
      {label}
    </button>
  </div>
)

export const Hint = () => (
  <div className='flex justify-center p-10'>
    <Tip label='Invite teammates' hint='Only admins can invite new members' />
  </div>
)
