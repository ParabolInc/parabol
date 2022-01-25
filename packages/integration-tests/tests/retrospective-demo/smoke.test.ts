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
})
