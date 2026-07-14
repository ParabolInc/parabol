import {DashboardAvatars} from 'parabol-client'

// Identity react-relay stub: useFragment(f, ref) => ref, so we pass the
// fragment's $data shape directly as the `team` ref.
const avatar = (hue: number) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='hsl(${hue},60%25,55%25)'/%3E%3C/svg%3E`

const member = (i: number, name: string, hue: number) => ({
  id: `tm${i}`,
  teamId: 'team1',
  user: {picture: avatar(hue), preferredName: name, isConnected: true}
})

const team = {
  id: 'team1',
  teamMembers: [
    member(1, 'Jordan Husney', 10),
    member(2, 'Aki Tanaka', 150),
    member(3, 'Mel Rivera', 265),
    member(4, 'Sam Cho', 320)
  ]
}

export const TeamRow = () => <DashboardAvatars team={team} />
