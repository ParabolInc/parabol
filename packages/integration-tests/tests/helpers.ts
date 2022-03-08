import {Locator, expect} from '@playwright/test'

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
