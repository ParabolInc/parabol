import {test, expect} from '@playwright/test'
import {skipToVotePhase} from './retrospective-demo-helpers'

test.describe('retrospective-demo / vote page', () => {
  test('it allows voting up a group', async ({page}) => {
    await skipToVotePhase(page)
    const voteCount = page.locator(`[data-cy="Start-group-0"] [data-cy="completed-vote-count"]`)
    await expect(voteCount).toHaveText('0')
    await page.locator(`[data-cy="Start-group-0"] [aria-label="Add vote"]`).click()
    await expect(voteCount).toHaveText('1')
  })

  test('it allows removing a vote from a group', async ({page}) => {
    await skipToVotePhase(page)
    const voteCount = page.locator(`[data-cy="Start-group-0"] [data-cy="completed-vote-count"]`)
    await expect(voteCount).toHaveText('0')
    await page.locator(`[data-cy="Start-group-0"] [aria-label="Add vote"]`).click()
    await expect(voteCount).toHaveText('1')
    await page.locator(`[data-cy="Start-group-0"] [aria-label="Remove vote"]`).click()
    await expect(voteCount).toHaveText('0')
  })

  test('it allows voting up a topic up to three times by default', async ({page}) => {
    await skipToVotePhase(page)
    const voteCount = page.locator(`[data-cy="Start-group-0"] [data-cy="completed-vote-count"]`)
    const addVote = page.locator(`[data-cy="Start-group-0"] [aria-label="Add vote"]`)
    await expect(voteCount).toHaveText('0')
    await addVote.click()
    await expect(voteCount).toHaveText('1')
    await addVote.click()
    await expect(voteCount).toHaveText('2')
    await addVote.click()
    await expect(voteCount).toHaveText('3')
    await addVote.click()
    await expect(voteCount).toHaveText('3') // 3 is the default maximum per-topic
  })

  test('it allows up to 5 total votes by default', async ({page}) => {
    await skipToVotePhase(page)

    // Vote three times on start group 0
    const group0VoteCount = page.locator(
      `[data-cy="Start-group-0"] [data-cy="completed-vote-count"]`
    )
    await expect(group0VoteCount).toHaveText('0')
    const group0AddVote = page.locator(`[data-cy="Start-group-0"] [aria-label="Add vote"]`)
    await group0AddVote.click()
    await group0AddVote.click()
    await group0AddVote.click()
    await expect(group0VoteCount).toHaveText('3')

    // And two times on start group 1
    const group1VoteCount = page.locator(
      `[data-cy="Start-group-1"] [data-cy="completed-vote-count"]`
    )
    await expect(group1VoteCount).toHaveText('0')
    const group1AddVote = page.locator(`[data-cy="Start-group-1"] [aria-label="Add vote"]`)
    await group1AddVote.click()
    await group1AddVote.click()
    await group1AddVote.click()
    await expect(group1VoteCount).toHaveText('2') // Even though you clicked 3 times, you're out of votes
  })

  test('it does not allow downvoting a group with no votes', async ({page}) => {
    await skipToVotePhase(page)
    const voteCount = page.locator(`[data-cy="Start-group-0"] [data-cy="completed-vote-count"]`)
    await expect(voteCount).toHaveText('0')
    const removeVote = page.locator(`[data-cy="Start-group-0"] [aria-label="Remove vote"]`)
    await removeVote.click()
    await expect(voteCount).toHaveText('0')
  })
})
