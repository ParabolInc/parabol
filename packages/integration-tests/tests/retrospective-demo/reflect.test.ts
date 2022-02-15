import config from '../config'
import {test, expect} from '@playwright/test'

test.describe('restrospective-demo / reflect page', () => {
  test('allows the user to enter feedback in start column', async ({page}) => {
    await config.goto(page, '/retrospective-demo')
    await page.click('text=Start Demo')

    const startTextbox = '[data-cy=reflection-column-Start] [role=textbox]'
    await page.click(startTextbox)
    await page.type(startTextbox, 'Start doing this')
    await page.press(startTextbox, 'Enter')

    await expect(
      page.locator('[data-cy="reflection-stack-Start"] :text("Start doing this")')
    ).toBeVisible()
  })

  test('allows the user to enter feedback in the stop column', async ({page}) => {
    await config.goto(page, '/retrospective-demo')
    await page.click('text=Start Demo')

    const startTextbox = '[data-cy=reflection-column-Stop] [role=textbox]'
    await page.click(startTextbox)
    await page.type(startTextbox, 'Stop doing this')
    await page.press(startTextbox, 'Enter')

    await expect(
      page.locator('[data-cy="reflection-stack-Stop"] :text("Stop doing this")')
    ).toBeVisible()
  })

  test('allows the user to enter feedback in the continue column', async ({page}) => {
    await config.goto(page, '/retrospective-demo')
    await page.click('text=Start Demo')

    const startTextbox = '[data-cy=reflection-column-Continue] [role=textbox]'
    await page.click(startTextbox)
    await page.type(startTextbox, 'Continue doing this')
    await page.press(startTextbox, 'Enter')

    await expect(
      page.locator('[data-cy="reflection-stack-Continue"] :text("Continue doing this")')
    ).toBeVisible()
  })

  test('allows the user to delete previously entered feedback', async ({page}) => {
    await config.goto(page, '/retrospective-demo')
    await page.click('text=Start Demo')

    const startTextbox = '[data-cy=reflection-column-Start] [role=textbox]'
    await page.click(startTextbox)
    await page.type(startTextbox, 'Start doing this')
    await page.press(startTextbox, 'Enter')

    await expect(
      page.locator('[data-cy="reflection-stack-Start"] :text("Start doing this")')
    ).toBeVisible()

    await page.click(
      '[data-cy="reflection-stack-Start"] [aria-label="Delete this reflection card"]'
    )

    await expect(
      page.locator('[data-cy="reflection-stack-Start"] :text("Start doing this")')
    ).not.toBeVisible()
  })

  test('displays simulated users writing reflections in the start column', async ({page}) => {
    test.setTimeout(30_000)

    await config.goto(page, '/retrospective-demo')
    await page.click('text=Start Demo')

    await expect(
      page.locator(
        '[data-cy=reflection-column-Start] :text("2 team members writing reflections...")'
      )
    ).toBeVisible()

    await expect(
      page.locator(
        '[data-cy=reflection-column-Start] :text("1 team member reflection + 2 in progress")'
      )
    ).toBeVisible()

    await expect(
      page.locator(
        '[data-cy=reflection-column-Start] :text("2 team member reflections + 2 in progress")'
      )
    ).toBeVisible()

    await expect(
      page.locator(
        '[data-cy=reflection-column-Start] :text("2 team member reflections + 1 in progress")'
      )
    ).toBeVisible()

    await expect(
      page.locator('[data-cy=reflection-column-Start] :text("2 team member reflections")')
    ).toBeVisible()
  })

  test('displays simulated users writing reflections in the stop column', async ({page}) => {
    test.setTimeout(60_000)

    await config.goto(page, '/retrospective-demo')
    await page.click('text=Start Demo')

    await expect(
      page.locator('[data-cy=reflection-column-Stop] :text("1 team member writing reflections...")')
    ).toBeVisible({
      timeout: 20_000 // first, the simulated users are only typing in the "Start" column, so this takes > 5 seconds
    })

    await expect(
      page.locator(
        '[data-cy=reflection-column-Stop] :text("1 team member reflection + 1 in progress")'
      )
    ).toBeVisible()

    await expect(
      page.locator(
        '[data-cy=reflection-column-Stop] :text("1 team member reflection + 2 in progress")'
      )
    ).toBeVisible()

    await expect(
      page.locator(
        '[data-cy=reflection-column-Stop] :text("2 team member reflections + 2 in progress")'
      )
    ).toBeVisible()

    await expect(
      page.locator(
        '[data-cy=reflection-column-Stop] :text("3 team member reflections + 2 in progress")'
      )
    ).toBeVisible()

    await expect(
      page.locator(
        '[data-cy=reflection-column-Stop] :text("4 team member reflections + 2 in progress")'
      )
    ).toBeVisible()

    await expect(
      page.locator(
        '[data-cy=reflection-column-Stop] :text("5 team member reflections + 2 in progress")'
      )
    ).toBeVisible()

    await expect(
      page.locator(
        '[data-cy=reflection-column-Stop] :text("5 team member reflections + 1 in progress")'
      )
    ).toBeVisible()

    await expect(
      page.locator('[data-cy=reflection-column-Stop] :text("5 team member reflections")')
    ).toBeVisible()
  })

  test('displays simulated users writing reflections in the continue column', async ({page}) => {
    test.setTimeout(80_000)

    await config.goto(page, '/retrospective-demo')
    await page.click('text=Start Demo')

    await expect(
      page.locator(
        '[data-cy=reflection-column-Continue] :text("1 team member writing reflections...")'
      )
    ).toBeVisible({
      timeout: 40_000 // first, the simulated users are only typing in the "Start"/"Stop" columns, so this takes > 5 seconds
    })

    await expect(
      page.locator(
        '[data-cy=reflection-column-Continue] :text("2 team members writing reflections...")'
      )
    ).toBeVisible({
      timeout: 20_000 // this seems to be delayed from the server
    })

    await expect(
      page.locator(
        '[data-cy=reflection-column-Continue] :text("1 team member reflection + 2 in progress")'
      )
    ).toBeVisible()

    await expect(
      page.locator(
        '[data-cy=reflection-column-Continue] :text("1 team member reflection + 1 in progress")'
      )
    ).toBeVisible()

    await expect(
      page.locator('[data-cy=reflection-column-Continue] :text("1 team member reflection")')
    ).toBeVisible()
  })
})
