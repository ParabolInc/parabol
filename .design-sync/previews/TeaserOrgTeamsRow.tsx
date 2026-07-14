import {TeaserOrgTeamsRow} from 'parabol-client'

// FLOOR CARD: TeaserOrgTeamsRow calls useNavigate() at render, requiring a
// react-router <Router> ancestor. react-router is privately bundled inside the
// parabol-client DS bundle, so a <MemoryRouter> from this preview is a different
// module copy and cannot populate the router context. Blanks with
// "useNavigate() may be used only in the context of a <Router>". See learnings.
export const LockedTeams = () => (
  <div className='w-[640px] rounded bg-white shadow'>
    <TeaserOrgTeamsRow hiddenTeamCount={4} orgId='org123' />
  </div>
)
