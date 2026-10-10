import {expect, test} from '@playwright/test'
import config from '../config'
import {
  goToNextPhase,
  goToNextPhaseWhenReady,
  meetingNav,
  promptColumn,
  reflectionEditor,
  startDemo
} from './retrospective-demo-helpers'

test.describe('retrospective-demo / reflect page', () => {
  test('it shows an explanation popup', async ({page}) => {
    await startDemo(page)

    await expect(page.locator('[aria-label="Meeting tips"]')).toBeVisible()
    await expect(
      page.locator('[aria-label="Meeting tips"] :text("It Starts with Brutal Honesty")')
    ).toBeVisible()
    await expect(
      page.locator(
        '[aria-label="Meeting tips"] :text("When you’re ready to move on, hit the Next button below.")'
      )
    ).toBeVisible()
  })

  test('allows the user to enter feedback in start column', async ({page}) => {
    await startDemo(page)

    const startTextbox = reflectionEditor(page, 'Start')
    await startTextbox.click()
    await startTextbox.pressSequentially('Start doing this')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')

    await expect(promptColumn(page, 'Start').getByText('Start doing this')).toBeVisible()
  })

  test('allows the user to enter feedback in the stop column', async ({page}) => {
    await startDemo(page)

    const stopTextbox = reflectionEditor(page, 'Stop')
    await stopTextbox.click()
    await stopTextbox.pressSequentially('Stop doing this')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')

    await expect(promptColumn(page, 'Stop').getByText('Stop doing this')).toBeVisible()
  })

  test('allows the user to enter feedback in the continue column', async ({page}) => {
    await startDemo(page)

    const continueTextbox = reflectionEditor(page, 'Continue')
    await continueTextbox.click()
    await continueTextbox.fill('Continue doing this')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')

    await expect(promptColumn(page, 'Continue').getByText('Continue doing this')).toBeVisible()
  })

  test('allows the user to delete previously entered feedback', async ({page}) => {
    await startDemo(page)

    const startTextbox = reflectionEditor(page, 'Start')
    await startTextbox.click()
    await startTextbox.fill('Start doing this')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')

    await expect(promptColumn(page, 'Start').getByText('Start doing this')).toBeVisible()

    await promptColumn(page, 'Start')
      .getByRole('button', {name: 'Delete this reflection card'})
      .click()

    await expect(promptColumn(page, 'Start').getByText('Start doing this')).not.toBeVisible()
  })

  test('displays simulated users writing reflections in the start column', async ({page}) => {
    await startDemo(page)

    await expect(
      promptColumn(page, 'Start').getByText('2 team members writing reflections...')
    ).toBeVisible()

    await expect(
      promptColumn(page, 'Start').getByText('1 team member reflection + 2 in progress')
    ).toBeVisible()

    await expect(
      promptColumn(page, 'Start').getByText('2 team member reflections + 2 in progress')
    ).toBeVisible()

    await expect(
      promptColumn(page, 'Start').getByText('2 team member reflections + 1 in progress')
    ).toBeVisible()

    await expect(promptColumn(page, 'Start').getByText('2 team member reflections')).toBeVisible()
  })

  test.skip('displays simulated users writing reflections in the stop column', async ({page}) => {
    test.setTimeout(60_000)

    await startDemo(page)

    await expect(
      promptColumn(page, 'Stop').getByText('1 team member writing reflections...')
    ).toBeVisible({
      timeout: 20_000 // first, the simulated users are only typing in the "Start" column, so this takes > 5 seconds
    })

    await expect(
      promptColumn(page, 'Stop').getByText('1 team member reflection + 1 in progress')
    ).toBeVisible()

    await expect(
      promptColumn(page, 'Stop').getByText('1 team member reflection + 2 in progress')
    ).toBeVisible()

    await expect(
      promptColumn(page, 'Stop').getByText('2 team member reflections + 2 in progress')
    ).toBeVisible()

    await expect(
      promptColumn(page, 'Stop').getByText('3 team member reflections + 2 in progress')
    ).toBeVisible()

    await expect(
      promptColumn(page, 'Stop').getByText('4 team member reflections + 2 in progress')
    ).toBeVisible()

    await expect(
      promptColumn(page, 'Stop').getByText('5 team member reflections + 2 in progress')
    ).toBeVisible()

    await expect(
      promptColumn(page, 'Stop').getByText('5 team member reflections + 1 in progress')
    ).toBeVisible()

    await expect(promptColumn(page, 'Stop').getByText('5 team member reflections')).toBeVisible()
  })

  test.skip('displays simulated users writing reflections in the continue column', async ({
    page
  }) => {
    test.setTimeout(80_000)

    await startDemo(page)

    await expect(
      promptColumn(page, 'Continue').getByText('1 team member writing reflections...')
    ).toBeVisible({
      timeout: 40_000 // first, the simulated users are only typing in the "Start"/"Stop" columns, so this takes > 5 seconds
    })

    await expect(
      promptColumn(page, 'Continue').getByText('2 team members writing reflections...')
    ).toBeVisible({
      timeout: 20_000 // this seems to be delayed from the server
    })

    await expect(
      promptColumn(page, 'Continue').getByText('1 team member reflection + 2 in progress')
    ).toBeVisible()

    await expect(
      promptColumn(page, 'Continue').getByText('1 team member reflection + 1 in progress')
    ).toBeVisible()

    await expect(promptColumn(page, 'Continue').getByText('1 team member reflection')).toBeVisible()
  })

  test('transitions to the group phase after clicking "next" twice', async ({page}) => {
    test.setTimeout(80_000)

    await startDemo(page)
    await expect(
      promptColumn(page, 'Continue').getByText('1 team member writing reflections...')
    ).toBeVisible({
      timeout: 40_000 // first, the simulated users are only typing in the "Start"/"Stop" columns, so this takes > 5 seconds
    })

    await expect(
      promptColumn(page, 'Continue').getByText('2 team members writing reflections...')
    ).toBeVisible({
      timeout: 20_000 // this seems to be delayed from the server
    })

    await expect(
      promptColumn(page, 'Continue').getByText('1 team member reflection + 2 in progress')
    ).toBeVisible()

    await expect(page.locator('button :text("1 / 2 Ready")')).toBeVisible()

    await expect(
      promptColumn(page, 'Continue').getByText('1 team member reflection + 1 in progress')
    ).toBeVisible()

    await expect(promptColumn(page, 'Continue').getByText('1 team member reflection')).toBeVisible()

    await goToNextPhaseWhenReady(page)

    expect(page.url()).toEqual(`${config.rootUrlPath}/retrospective-demo/group`)
  })

  test('marks the reflect phase as completed after transitioning to group phase', async ({
    page,
    isMobile
  }) => {
    await startDemo(page)
    await goToNextPhase(page)
    expect(page.url()).toEqual(`${config.rootUrlPath}/retrospective-demo/group`)

    if (isMobile) {
      await page.click('button[aria-label="Toggle the sidebar"]')
    }

    await meetingNav(page).getByText('Reflect', {exact: true}).click()
    expect(page.url()).toEqual(`${config.rootUrlPath}/retrospective-demo/reflect`)
    await expect(page.locator(':text("Phase Completed")')).toBeVisible()
  })
})
