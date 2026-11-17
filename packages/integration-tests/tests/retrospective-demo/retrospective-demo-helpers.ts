import {expect, type Locator, type Page} from '@playwright/test'
import config from '../config'

export async function startDemo(page: Page) {
  await config.goto(page, '/retrospective-demo')
  await page.click('text=Start Demo')
}

export async function goToNextPhase(page: Page) {
  const nextButton = page.locator('button', {
    hasText: new RegExp(/\d+ \/ \d+ Ready/)
  })
  await expect(nextButton).toBeVisible()

  // You "confirm" going to the next phase by clicking the next button twice
  await nextButton.click()
  await nextButton.click()
}

export async function goToNextPhaseWhenReady(page: Page) {
  const nextButton = page.locator('button :text("Next")')
  await expect(nextButton).toBeVisible()

  await nextButton.click()
}

export async function skipToGroupPhase(page: Page) {
  await startDemo(page)
  await goToNextPhase(page)
  expect(page.url()).toEqual(`${config.rootUrlPath}/retrospective-demo/group`)
}

export async function skipToVotePhase(page: Page) {
  await skipToGroupPhase(page)
  await goToNextPhase(page)
  expect(page.url()).toEqual(`${config.rootUrlPath}/retrospective-demo/vote`)
}

export async function skipToDiscussPhase(page: Page) {
  await skipToVotePhase(page)
  await goToNextPhase(page)
  expect(page.url()).toEqual(`${config.rootUrlPath}/retrospective-demo/discuss/1`)
}

export async function dragReflectionCard(
  cardToDrag: Locator,
  destination: Locator,
  options: {waitForAnimation?: boolean} = {}
) {
  const {waitForAnimation = true} = options

  await cardToDrag.dragTo(destination)
  if (waitForAnimation) {
    // When dragging the card from one place to another, a "clone" is created
    // during the animation. Therefore, wait for the card animation to complete
    // to make further assertions.
    await expect(cardToDrag).toHaveCount(1)
  }
}

const PROMPTS = ['Start', 'Stop', 'Continue'] as const
type Prompt = (typeof PROMPTS)[number]

// A column has no accessible name, so it is the outermost block that shows its own prompt and no other prompt
export function promptColumn(page: Page, prompt: Prompt) {
  return PROMPTS.filter((otherPrompt) => otherPrompt !== prompt)
    .reduce(
      (column, otherPrompt) => column.filter({hasNot: page.getByText(otherPrompt, {exact: true})}),
      page.locator('div').filter({has: page.getByText(prompt, {exact: true})})
    )
    .first()
}

export function reflectionEditor(page: Page, prompt: Prompt) {
  // the editor comes before the reflections already added to its column
  return promptColumn(page, prompt).getByRole('textbox').first()
}

export function voteControls(page: Page, prompt: Prompt, groupIdx: number) {
  const column = promptColumn(page, prompt)
  const addVote = column.getByRole('button', {name: 'Add vote'}).nth(groupIdx)
  const removeVote = column.getByRole('button', {name: 'Remove vote'}).nth(groupIdx)
  // the vote buttons are icons, so the count is the only text in the row that holds them
  const voteCount = addVote.locator('..')
  return {addVote, removeVote, voteCount}
}

export function meetingNav(page: Page) {
  return page.getByRole('list').filter({has: page.getByText('Reflect', {exact: true})})
}
