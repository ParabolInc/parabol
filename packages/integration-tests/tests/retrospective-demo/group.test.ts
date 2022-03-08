import config from '../config'
import {test, expect} from '@playwright/test'
import {dragReflectionCard} from '../helpers'

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

  test('it allows grouping user-entered input from the reflect phase', async ({page, isMobile}) => {
    test.skip(
      isMobile,
      'Scrolling while dragging presents problems. See https://github.com/microsoft/playwright/issues/12599.'
    )

    await config.goto(page, '/retrospective-demo')
    await page.click('text=Start Demo')

    const startTextbox = '[data-cy=reflection-column-Start] [role=textbox]'
    await page.click(startTextbox)
    await page.type(startTextbox, 'Documenting things in Notion')
    await page.press(startTextbox, 'Enter')

    const stopTextbox = '[data-cy=reflection-column-Stop] [role=textbox]'
    await page.click(stopTextbox)
    await page.type(stopTextbox, 'Making decisions in one-on-one meetings')
    await page.press(stopTextbox, 'Enter')

    const nextButton = page.locator('button :text("Next")')
    await expect(nextButton).toBeVisible()
    await nextButton.click()
    await nextButton.click()
    expect(page.url()).toEqual(`${config.rootUrlPath}/retrospective-demo/group`)

    const decisionsInOneOnOnesCard = page.locator('text=Making decisions in one-on-one meetings')
    const documentingInNotionCard = page.locator('text=Documenting things in notion')
    await dragReflectionCard(decisionsInOneOnOnesCard, documentingInNotionCard)

    // Then it auto-generates a header
    await expect(
      page.locator(
        `[data-cy=group-column-Start] [data-cy*="Start-group-"] input[value="Documenting things in"]`
      )
    ).toBeVisible()

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

    await config.goto(page, '/retrospective-demo')
    await page.click('text=Start Demo')

    const nextButton = page.locator('button :text("Next")')
    await expect(nextButton).toBeVisible()
    await nextButton.click()
    await nextButton.click()
    expect(page.url()).toEqual(`${config.rootUrlPath}/retrospective-demo/group`)

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

    // It created the "People Decisions Interns" group
    await expect(
      page.locator(
        `[data-cy=group-column-Start] [data-cy*="Start-group-"] input[value="People Decisions Interns"]`
      )
    ).toBeVisible({timeout})

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

    // It created the "Team Work" group
    await expect(
      page.locator(
        `[data-cy=group-column-Continue] [data-cy*="Continue-group-"] input[value="Team Work"]`
      )
    ).toBeVisible({timeout})

    // It drags "debates" card from Stop to Continue
    await expect(
      page.locator(`[data-cy=group-column-Continue] :text("${debatesText}")`)
    ).toBeVisible({
      timeout
    })
  })
})
