import {Page, expect, Locator} from '@playwright/test'
import config from '../config'

export async function startDemo(page: Page) {
  await config.goto(page, '/retrospective-demo')
  await page.click('text=Start Demo')
}

export async function goToNextPhase(page: Page) {
  const nextButton = page.locator('button :text("Next")')
  await expect(nextButton).toBeVisible()

  // You "confirm" going to the next phase by clicking the next button twice
  await nextButton.click()
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
