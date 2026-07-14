import {sendPublic, signUp} from './common'

test('Team.secondaryStatuses is empty for a fresh team', async () => {
  const {teamId, cookie} = await signUp()
  const res = await sendPublic({
    query: `
      query TeamSecondaryStatuses {
        viewer {
          teams {
            id
            secondaryStatuses {
              id
              label
              status
              sortOrder
            }
          }
        }
      }
    `,
    cookie
  })
  expect(res.errors).toBeUndefined()
  const team = res.data.viewer.teams.find((t: {id: string}) => t.id === teamId)
  expect(team.secondaryStatuses).toEqual([])
})
