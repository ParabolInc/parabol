import config from '../config'
import {test, expect} from '@playwright/test'

test.describe('retrospective-demo / smoke test', () => {
  test('displays a welcome dialog', async ({page}) => {
    // await config.goto(page, '/retrospective-demo')
    await page.goto('http://localhost:3000/retrospective-demo')
    await expect(page.locator('button', {hasText: 'Start Demo'})).toBeVisible()
  })
})
