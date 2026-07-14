import {DashboardAvatar} from 'parabol-client'

// Identity Relay stub: teamMember ref is the fragment $data. The spread menu/
// modal fragments are only read when their menus open, so they aren't needed here.
const avatar = (hue: number) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='hsl(${hue},60%25,55%25)'/%3E%3C/svg%3E`

const member = (id: string, name: string, hue: number, isConnected: boolean) => ({
  id,
  teamId: 'team1',
  user: {picture: avatar(hue), preferredName: name, isConnected}
})

export const Connected = () => (
  <div className='flex gap-2 rounded-lg bg-white p-3 shadow'>
    <DashboardAvatar teamMember={member('tm1', 'Jordan Husney', 10, true)} />
  </div>
)

export const Offline = () => (
  <div className='flex gap-2 rounded-lg bg-white p-3 shadow'>
    <DashboardAvatar teamMember={member('tm2', 'Aki Tanaka', 150, false)} />
  </div>
)

export const Row = () => (
  <div className='flex gap-2 rounded-lg bg-white p-3 shadow'>
    <DashboardAvatar teamMember={member('tm1', 'Jordan Husney', 10, true)} />
    <DashboardAvatar teamMember={member('tm3', 'Mel Rivera', 265, true)} />
    <DashboardAvatar teamMember={member('tm4', 'Sam Cho', 320, false)} />
  </div>
)
