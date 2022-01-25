import config from '../config'
import {test, expect} from '@playwright/test'

test.describe('retrospective-demo / smoke test', () => {
  test('displays a welcome dialog', async ({page}) => {
    await config.goto(page, '/retrospective-demo')
    await expect(page.locator('button', {hasText: 'Start Demo'})).toBeVisible()
  })

  test('displays the reflect page first', async ({page}) => {
    await config.goto(page, '/retrospective-demo')
    await page.click('text=Start Demo')
    await expect(page.locator('h1:has-text("Reflect")')).toBeVisible()
    await expect(page.locator('[data-cy=reflection-column-Start]')).toBeVisible()
    await expect(page.locator('[data-cy=reflection-column-Stop]')).toBeVisible()
    await expect(page.locator('[data-cy=reflection-column-Continue]')).toBeVisible()
  })

  test('navigates to the group phase when clicking the next button', async ({page}) => {
    // Given a new visitor to the retrospective demo page
    await config.goto(page, '/retrospective-demo')

    // When they start the demo
    await page.click('text=Start Demo')

    // When they enter a response
    const startTextbox = '[data-cy=reflection-column-Start] [role=textbox]'
    await page.click(startTextbox)
    await page.type(startTextbox, 'Start doing this')
    await page.press(startTextbox, 'Enter')

    // When they click the "Next" button once
    await page.click('[data-cy="next-phase"]')

    // Then they see a popover message telling them to tap "Next" again
    await expect(page.locator(`#portal :text("Tap 'Next' again to confirm")`)).toBeVisible()

    // When they click the "Next" button again
    await page.click('[data-cy="next-phase"]')

    // Then they transition to the group phase
    await expect(page.locator('h1:has-text("Group")')).toBeVisible()
    expect(page.url()).toEqual(config.urlForPath('/retrospective-demo/group'))
  })
})
