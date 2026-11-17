import {expect, test} from '@playwright/test'
import config from '../config'
import {
  dragReflectionCard,
  goToNextPhase,
  meetingNav,
  promptColumn,
  reflectionEditor,
  skipToGroupPhase,
  startDemo
} from './retrospective-demo-helpers'

test.describe('retrospective-demo / group page', () => {
  test('it carries over user-entered input from the reflect phase', async ({page}) => {
    await startDemo(page)

    const startTextbox = reflectionEditor(page, 'Start')
    await startTextbox.click()
    await startTextbox.pressSequentially('Start doing this')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')

    const stopTextbox = reflectionEditor(page, 'Stop')
    await stopTextbox.click()
    await stopTextbox.pressSequentially('Stop doing this')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')

    const continueTextbox = reflectionEditor(page, 'Continue')
    await continueTextbox.click()
    await continueTextbox.pressSequentially('Continue doing this')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')

    await goToNextPhase(page)
    expect(page.url()).toEqual(`${config.rootUrlPath}/retrospective-demo/group`)

    await expect(promptColumn(page, 'Start').getByText('Start doing this')).toBeVisible()
    await expect(promptColumn(page, 'Stop').getByText('Stop doing this')).toBeVisible()
    await expect(promptColumn(page, 'Continue').getByText('Continue doing this')).toBeVisible()
  })

  test('it allows grouping user-entered input from the reflect phase - same column', async ({
    page
  }) => {
    await startDemo(page)

    const startTextbox = reflectionEditor(page, 'Start')
    await startTextbox.click()
    await startTextbox.pressSequentially('Documenting things in Notion')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    await expect(
      promptColumn(page, 'Start').getByText('Documenting things in Notion')
    ).toBeVisible()

    await startTextbox.click()
    await startTextbox.pressSequentially('Writing things down')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    await expect(promptColumn(page, 'Start').getByText('Writing things down')).toBeVisible()

    await goToNextPhase(page)
    expect(page.url()).toEqual(`${config.rootUrlPath}/retrospective-demo/group`)

    const writingThingsDownCard = page.locator('text=Writing things down')
    const documentingInNotionCard = page.locator('text=Documenting things in Notion')
    await dragReflectionCard(writingThingsDownCard, documentingInNotionCard)

    // Then it shows all cards when clicking the group
    await writingThingsDownCard.click()
    await expect(
      page.locator('#expandedReflectionGroup :text("Writing things down")')
    ).toBeVisible()
    await expect(
      page.locator('#expandedReflectionGroup :text("Documenting things in notion")')
    ).toBeVisible()
  })

  test('it allows grouping user-entered input from the reflect phase - different columns', async ({
    page,
    isMobile
  }) => {
    test.skip(
      isMobile,
      'Scrolling between columns while dragging presents problems. See https://github.com/microsoft/playwright/issues/12599 and upvote https://github.com/microsoft/playwright/issues/2903.'
    )

    await startDemo(page)

    const startTextbox = reflectionEditor(page, 'Start')
    await startTextbox.click()
    await startTextbox.fill('Documenting things in Notion')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    await expect(
      promptColumn(page, 'Start').getByText('Documenting things in Notion')
    ).toBeVisible()

    const stopTextbox = reflectionEditor(page, 'Stop')
    await stopTextbox.click()
    await stopTextbox.fill('Making decisions in one-on-one meetings')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    await expect(
      promptColumn(page, 'Stop').getByText('Making decisions in one-on-one meetings')
    ).toBeVisible()

    await goToNextPhase(page)
    expect(page.url()).toEqual(`${config.rootUrlPath}/retrospective-demo/group`)

    const decisionsInOneOnOnesCard = page.locator('text=Making decisions in one-on-one meetings')
    const documentingInNotionCard = page.locator('text=Documenting things in notion')
    await dragReflectionCard(decisionsInOneOnOnesCard, documentingInNotionCard)

    // Then it shows all cards when clicking the group
    await decisionsInOneOnOnesCard.click()
    await expect(
      page.locator('#expandedReflectionGroup :text("Making decisions in one-on-one meetings")')
    ).toBeVisible()
    await expect(
      page.locator('#expandedReflectionGroup :text("Documenting things in notion")')
    ).toBeVisible()
  })

  test('it demos drag-and-drop grouping', async ({page}) => {
    test.slow()
    const timeout = 20_000

    await skipToGroupPhase(page)

    // Validate all dragged cards begin in the "Stop" column
    const airTimeText = `Some people always take all the air time. It's hard to get my ideas on the floor`
    await expect(promptColumn(page, 'Stop').getByText(airTimeText)).toBeVisible()
    const decisionsText = `Making important decisions in chat`
    await expect(promptColumn(page, 'Stop').getByText(decisionsText)).toBeVisible()
    const prioritizingWorkText = `Prioritizing so much work every sprint, we can't get it all done!`
    await expect(promptColumn(page, 'Stop').getByText(prioritizingWorkText)).toBeVisible()
    const debatesText = `Having debates that go nowhere over group chat`
    await expect(promptColumn(page, 'Stop').getByText(debatesText)).toBeVisible()

    // It first drags the "some people always take all the air time" card from Stop to Start
    await expect(promptColumn(page, 'Start').getByText(airTimeText)).toBeVisible({
      timeout
    })

    // It drags the "making important decisions in chat" card from Stop to Start
    await expect(promptColumn(page, 'Start').getByText(decisionsText)).toBeVisible({
      timeout
    })

    // It drags "prioritizing work" card from Stop to Continue
    await expect(promptColumn(page, 'Continue').getByText(prioritizingWorkText)).toBeVisible({
      timeout
    })

    // It drags "debates" card from Stop to Continue
    await expect(promptColumn(page, 'Continue').getByText(debatesText)).toBeVisible({
      timeout
    })
  })

  test('transitions to the vote phase after clicking "next" twice', async ({page}) => {
    await skipToGroupPhase(page)
    await goToNextPhase(page)
    expect(page.url()).toEqual(`${config.rootUrlPath}/retrospective-demo/vote`)
  })

  test('marks the group phase as completed after transitioning to vote phase', async ({
    page,
    isMobile
  }) => {
    test.skip(
      isMobile,
      'For some reason, we get an "Element is out of viewport" error on this page when toggling the sidebar on mobile. This does not happen in other phases.'
    )

    await skipToGroupPhase(page)
    await goToNextPhase(page)
    expect(page.url()).toEqual(`${config.rootUrlPath}/retrospective-demo/vote`)

    if (isMobile) {
      await page.click('button[aria-label="Toggle the sidebar"]')
    }

    await meetingNav(page).getByText('Group', {exact: true}).click()
    expect(page.url()).toEqual(`${config.rootUrlPath}/retrospective-demo/group`)
    await expect(page.locator(':text("Phase Completed")')).toBeVisible()
  })
})
