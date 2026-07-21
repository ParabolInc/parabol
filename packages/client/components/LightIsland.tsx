import type {ReactNode} from 'react'

interface Props {
  children: ReactNode
}

/**
 * Pins a subtree to the light theme.
 *
 * Pre-login surfaces (auth, invitations, verify/reset password) render inside
 * chrome that is deliberately raw palette — TeamInvitationWrapper's
 * `bg-slate-200 text-slate-700`, AuthPage/Header's GRAPE_700 — so it never
 * flips with the theme. Token-based descendants like InviteDialog *do* flip,
 * which left dark cards floating on a light page. Pinning the whole subtree
 * light keeps both halves in agreement.
 *
 * `contents` generates no box, so this can wrap a route element without
 * disturbing the surrounding flex layout; custom properties and `color`
 * still inherit through it.
 */
const LightIsland = (props: Props) => {
  const {children} = props
  return <div className='light-island contents'>{children}</div>
}

export default LightIsland
