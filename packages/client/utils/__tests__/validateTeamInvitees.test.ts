import type {InviteeDraft} from '../../hooks/useTeamInviteeDrafts'
import {formatUnfinishedInvitee} from '../../shared/teamInvitees'
import validateTeamInvitees from '../validateTeamInvitees'

const ready = (email: string): InviteeDraft => ({email, rejection: null})

describe('validateTeamInvitees', () => {
  it('blocks an unfinished name when a directory is present', () => {
    expect(validateTeamInvitees({drafts: [], pendingText: 'Ann', hasDirectory: true})).toEqual({
      error: formatUnfinishedInvitee('Ann')
    })
  })

  it('does not treat the same text as unfinished without a directory', () => {
    const result = validateTeamInvitees({drafts: [], pendingText: 'Ann', hasDirectory: false})
    expect(result).toEqual({emails: []})
  })

  it('rejects an invalid draft', () => {
    const result = validateTeamInvitees({
      drafts: [ready('a@example.com'), ready('not-an-email')],
      pendingText: '',
      hasDirectory: true
    })
    expect(result).toEqual({
      error: 'Fix or remove the invalid email address above before creating the team'
    })
  })

  it('reports the excess over 50', () => {
    const drafts = Array.from({length: 51}, (_, i) => ready(`user${i}@example.com`))
    const result = validateTeamInvitees({drafts, pendingText: '', hasDirectory: true})
    expect(result).toMatchObject({error: expect.stringContaining('Remove 1,')})
  })

  it('returns the emails when everything is ready', () => {
    const result = validateTeamInvitees({
      drafts: [ready('a@example.com'), ready('b@example.com')],
      pendingText: '',
      hasDirectory: true
    })
    expect(result).toEqual({emails: ['a@example.com', 'b@example.com']})
  })
})
