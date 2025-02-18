import {expect, test} from '@playwright/test'
import config from '../config'
import {
  dragReflectionCard,
  goToNextPhase,
  skipToGroupPhase,
  startDemo
} from './retrospective-demo-helpers'

test.describe('retrospective-demo / group page', () => {
  test('it carries over user-entered input from the reflect phase', async ({page}) => {
    await startDemo(page)

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

    await goToNextPhase(page)
    expect(page.url()).toEqual(`${config.rootUrlPath}/retrospective-demo/group`)

    await expect(
      page.locator('[data-cy=group-column-Start] :text("Start doing this")')
    ).toBeVisible()
    await expect(page.locator('[data-cy=group-column-Stop] :text("Stop doing this")')).toBeVisible()
    await expect(
      page.locator('[data-cy=group-column-Continue] :text("Continue doing this")')
    ).toBeVisible()
  })

  test('it allows grouping user-entered input from the reflect phase - same column', async ({
    page
  }) => {
    await startDemo(page)

    const startTextbox = '[data-cy=reflection-column-Start] [role=textbox]'
    await page.click(startTextbox)
    await page.type(startTextbox, 'Documenting things in Notion')
    await page.press(startTextbox, 'Enter')
    await expect(
      page.locator('[data-cy="reflection-column-Start"] :text("Documenting things in Notion")')
    ).toBeVisible()

    await page.click(startTextbox)
    await page.type(startTextbox, 'Writing things down')
    await page.press(startTextbox, 'Enter')
    await expect(
      page.locator('[data-cy="reflection-column-Start"] :text("Writing things down")')
    ).toBeVisible()

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

    const startTextbox = '[data-cy=reflection-column-Start] [role=textbox]'
    await page.click(startTextbox)
    await page.fill(startTextbox, 'Documenting things in Notion')
    await page.press(startTextbox, 'Enter')
    await expect(
      page.locator('[data-cy="reflection-column-Start"] :text("Documenting things in Notion")')
    ).toBeVisible()

    const stopTextbox = '[data-cy=reflection-column-Stop] [role=textbox]'
    await page.click(stopTextbox)
    await page.fill(stopTextbox, 'Making decisions in one-on-one meetings')
    await page.press(stopTextbox, 'Enter')
    await expect(
      page.locator(
        '[data-cy="reflection-column-Stop"] :text("Making decisions in one-on-one meetings")'
      )
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
    await expect(page.locator(`[data-cy=group-column-Stop] :text("${airTimeText}")`)).toBeVisible()
    const decisionsText = `Making important decisions in chat`
    await expect(
      page.locator(`[data-cy=group-column-Stop] :text("${decisionsText}")`)
    ).toBeVisible()
    const prioritizingWorkText = `Prioritizing so much work every sprint, we can't get it all done!`
    await expect(
      page.locator(`[data-cy=group-column-Stop] :text("${prioritizingWorkText}")`)
    ).toBeVisible()
    const debatesText = `Having debates that go nowhere over group chat`
    await expect(page.locator(`[data-cy=group-column-Stop] :text("${debatesText}")`)).toBeVisible()

    // It first drags the "some people always take all the air time" card from Stop to Start
    await expect(page.locator(`[data-cy=group-column-Start] :text("${airTimeText}")`)).toBeVisible({
      timeout
    })

    // It drags the "making important decisions in chat" card from Stop to Start
    await expect(
      page.locator(`[data-cy=group-column-Start] :text("${decisionsText}")`)
    ).toBeVisible({
      timeout
    })

    // It drags "prioritizing work" card from Stop to Continue
    await expect(
      page.locator(`[data-cy=group-column-Continue] :text("${prioritizingWorkText}")`)
    ).toBeVisible({
      timeout
    })

    // It drags "debates" card from Stop to Continue
    await expect(
      page.locator(`[data-cy=group-column-Continue] :text("${debatesText}")`)
    ).toBeVisible({
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

    await page.click('[data-cy=sidebar] :text("Group")')
    expect(page.url()).toEqual(`${config.rootUrlPath}/retrospective-demo/group`)
    await expect(page.locator(':text("Phase Completed")')).toBeVisible()
  })
})
