import {EstimatePhaseEmptyState} from 'parabol-client'

// FLOOR CARD: renders a react-router <Link>, which reads RouterContext at render.
// react-router is privately bundled inside the parabol-client DS bundle, so a
// <MemoryRouter> from this preview is a different module copy and leaves that
// context null. Blanks with "Cannot destructure property 'basename' of
// useContext(...) as it is null." See learnings.
export const NoItems = () => (
  <div className='flex h-80 w-[640px] items-center justify-center bg-white'>
    <EstimatePhaseEmptyState meetingId='meeting123' />
  </div>
)
