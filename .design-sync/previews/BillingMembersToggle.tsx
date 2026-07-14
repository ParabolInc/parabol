import {BillingMembersToggle} from 'parabol-client'

// FLOOR CARD: BillingMembersToggle calls useNavigate()/useLocation() at render,
// which require a react-router <Router> ancestor. react-router is privately
// bundled inside the parabol-client DS bundle, so a <MemoryRouter> imported into
// this preview is a *different* module copy and cannot populate the context the
// component reads. Renders "useNavigate() may be used only in the context of a
// <Router>" and blanks. Cannot be satisfied statically. See learnings.
export const Default = () => (
  <div className='w-[420px] bg-white p-4'>
    <BillingMembersToggle orgId='org123' />
  </div>
)
