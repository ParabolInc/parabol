import config from '../config'
import {test, expect} from '@playwright/test'

test.describe('restrospective-demo / group page', () => {
  test('it carries over user-entered input from the reflect phase', async ({page}) => {
    await config.goto(page, '/retrospective-demo')
    await page.click('text=Start Demo')

    const startTextbox = '[data-cy=reflection-column-Start] [role=textbox]'
    await page.click(startTextbox)
    await page.type(startTextbox, 'Start doing this')
    await page.press(startTextbox, 'Enter')

    const stopTextbox = '[data-cy=reflection-column-Stop] [role=textbox]'
    await page.click(stopTextbox)
    await page.type(stopTextbox, 'Stop doing this')
    await page.press(stopTextbox, 'Enter')

    const continueTextbox = '[data-cy=reflection-column-Continue] [role=textbox]'
    await page.click(continueTextbox)
    await page.type(continueTextbox, 'Continue doing this')
    await page.press(continueTextbox, 'Enter')

    const nextButton = page.locator('button :text("Next")')
    await expect(nextButton).toBeVisible()
    await nextButton.click()
    await nextButton.click()
    expect(page.url()).toEqual(`${config.rootUrlPath}/retrospective-demo/group`)

    await expect(
      page.locator('[data-cy=group-column-Start] :text("Start doing this")')
    ).toBeVisible()
    await expect(page.locator('[data-cy=group-column-Stop] :text("Stop doing this")')).toBeVisible()
    await expect(
      page.locator('[data-cy=group-column-Continue] :text("Continue doing this")')
    ).toBeVisible()
  })

  test('it allows grouping user-entered input from the reflect phase', async ({page}) => {
    // todo
  })

  test('it shows all cards in the group when clicked', async ({page}) => {
    // todo
  })

  test('it demos drag-and-drop grouping', async ({page}) => {
    // todo
  })
})
