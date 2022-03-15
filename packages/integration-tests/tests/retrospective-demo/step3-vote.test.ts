import {test, expect} from '@playwright/test'
import config from '../config'
import {goToNextPhase, skipToVotePhase} from './retrospective-demo-helpers'

test.describe('retrospective-demo / vote page', () => {
  test('it allows voting up a group', async ({page}) => {
    await skipToVotePhase(page)
    const voteCount = page.locator(`[data-cy="Start-group-0"] [data-cy="completed-vote-count"]`)
    await expect(voteCount).toHaveText('0')
    await page.locator(`[data-cy="Start-group-0"] [aria-label="Add vote"]`).click()
    await expect(voteCount).toHaveText('1')
  })

  test('it reduces the number of votes remaining', async ({page}) => {
    await skipToVotePhase(page)
    const totalRemainingVotes = page.locator('div:right-of(:text("My Votes")) >> nth=0')
    await expect(totalRemainingVotes).toHaveText('5')
    await page.locator(`[data-cy="Start-group-0"] [aria-label="Add vote"]`).click()
    await expect(totalRemainingVotes).toHaveText('4')
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

  test('it allows increasing the maximum number of votes per-participant', async ({page}) => {
    await skipToVotePhase(page)
    await page.locator('text=Vote Settings').click()

    // Increase the maximum from 5 to 6
    const votesPerParticipant = page.locator(
      'span:right-of(:text("Votes per participant")) >> nth=0'
    )
    await expect(votesPerParticipant).toHaveText('5')
    await page
      .locator('[aria-label="Increase"]:right-of(:text("Votes per participant")) >> nth=0')
      .click()
    await expect(votesPerParticipant).toHaveText('6')
    await page.locator('text=Vote Settings').click()

    // Then add 6 total votes
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
    await expect(group1VoteCount).toHaveText('3')
  })

  test('it allows increasing the maximum number of votes per-topic', async ({page}) => {
    await skipToVotePhase(page)
    await page.locator('text=Vote Settings').click()

    // Increase the maximum from 3 to 4
    const votesPerTopic = page.locator('span:right-of(:text("Votes per topic")) >> nth=0')
    await expect(votesPerTopic).toHaveText('3')
    await page
      .locator('[aria-label="Increase"]:right-of(:text("Votes per topic")) >> nth=0')
      .click()
    await expect(votesPerTopic).toHaveText('4')
    await page.locator('text=Vote Settings').click()

    // Then add 4 votes to a single group
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
    await expect(voteCount).toHaveText('4')
    await addVote.click()
    await expect(voteCount).toHaveText('4') // 4 is the new maximum
  })

  test('transitions to the discuss phase after clicking "next" twice', async ({page}) => {
    await skipToVotePhase(page)
    await goToNextPhase(page)
    expect(page.url()).toEqual(`${config.rootUrlPath}/retrospective-demo/discuss/1`)
  })

  test('marks the vote phase as completed after transitioning to discuss phase', async ({
    page,
    isMobile
  }) => {
    await skipToVotePhase(page)
    await goToNextPhase(page)
    expect(page.url()).toEqual(`${config.rootUrlPath}/retrospective-demo/discuss/1`)

    if (isMobile) {
      await page.click('button[aria-label="Toggle the sidebar"]')
    }

    await page.click('[data-cy=sidebar] :text("Vote")')
    expect(page.url()).toEqual(`${config.rootUrlPath}/retrospective-demo/vote`)
    await expect(page.locator(':text("Phase Completed")')).toBeVisible()
  })
})
