import {test, expect} from '@playwright/test'
import config from '../config'
import {
  startDemo,
  goToNextPhase,
  dragReflectionCard,
  skipToDiscussPhase
} from './retrospective-demo-helpers'

test.describe('retrospective-demo / discuss page', () => {
  test('it carries over user-created groups', async ({page, isMobile}) => {
    await startDemo(page)

    const startTextbox = '[data-cy=reflection-column-Start] [role=textbox]'
    await page.click(startTextbox)
    await page.type(startTextbox, 'Documenting things in Notion')
    await page.press(startTextbox, 'Enter')

    await page.click(startTextbox)
    await page.type(startTextbox, 'Writing things down')
    await page.press(startTextbox, 'Enter')

    await goToNextPhase(page)
    expect(page.url()).toEqual(`${config.rootUrlPath}/retrospective-demo/group`)

    const writingThingsDownCard = page.locator('text=Writing things down')
    const documentingInNotionCard = page.locator('text=Documenting things in Notion')
    await dragReflectionCard(writingThingsDownCard, documentingInNotionCard)

    // Then it auto-generates a header - we expect to see this in the sidebar on the discuss page
    await expect(
      page.locator(
        `[data-cy=group-column-Start] [data-cy*="Start-group-"] input[value="Documenting things in"]`
      )
    ).toBeVisible()

    await goToNextPhase(page)
    expect(page.url()).toEqual(`${config.rootUrlPath}/retrospective-demo/vote`)
    await goToNextPhase(page)
    expect(page.url()).toEqual(`${config.rootUrlPath}/retrospective-demo/discuss/1`)

    if (isMobile) {
      await page.click('button[aria-label="Toggle the sidebar"]')
    }

    await expect(page.locator('[data-cy=sidebar] :text("Documenting things in")')).toBeVisible()
  })

  test('shows all the groups in the sidebar', async ({page, isMobile}) => {
    await skipToDiscussPhase(page)

    if (isMobile) {
      await page.click('button[aria-label="Toggle the sidebar"]')
    }

    await expect(page.locator('[data-cy=sidebar] div:text("Meetings")')).toBeVisible()
    await expect(page.locator('[data-cy=sidebar] div:text("Interns Staff")')).toBeVisible()
    await expect(page.locator('[data-cy=sidebar] div:text("Work")')).toBeVisible()
    await expect(page.locator('[data-cy=sidebar] div:text("Processes")')).toBeVisible()
    await expect(page.locator('[data-cy=sidebar] div:text("Team")')).toBeVisible()
    await expect(page.locator('[data-cy=sidebar] div:text("Debates")')).toBeVisible()
    await expect(page.locator('[data-cy=sidebar] div:text("Decisions")')).toBeVisible()
    await expect(page.locator('[data-cy=sidebar] div:text("People")')).toBeVisible()
  })

  interface DiscussTestCase {
    name: string
    emojis: Array<string>
    comments?: Array<string>
    tasks?: Array<string>
  }

  const discussTestCases: Array<DiscussTestCase> = [
    {
      name: 'Meetings',
      emojis: ['🚀', '🎉'],
      tasks: [
        'Try no-meeting Thursdays',
        'Use our planning meetings to discover which meetings and attendees to schedule'
      ],
      comments: [
        'While our meetings could be more efficient, we agree that some of them are necessary'
      ]
    },
    {
      name: 'Interns Staff',
      emojis: ['🤔'],
      tasks: ['Create a process for making a collective decision, together']
    },
    {
      name: 'Processes',
      emojis: ['✍️'],
      tasks: [
        'Document our testing process',
        'When onboarding new employees, have them document our processes as they learn them'
      ]
    },
    {
      name: 'Work',
      emojis: ['🔥'],
      tasks: ['Research reputable methods for prioritizing work that the team can review together']
    },
    {
      name: 'People',
      emojis: ['⏲'],
      tasks: ['Set a timer for speakers during meetings']
    },
    {
      name: 'Decisions',
      emojis: ['🔥'],
      tasks: ['Propose which kind of decisions need to be made by the whole group']
    },
    {
      name: 'Debates',
      emojis: ['❤️'],
      tasks: [
        'Create a policy for when to decide in-person vs. when to decide over Slack, and who needs to be involved for each type'
      ]
    },
    {
      name: 'Team',
      emojis: ['❤️']
    }
  ]
  discussTestCases.forEach((testCase) => createTest(testCase))

  function createTest({name, emojis, tasks, comments}: DiscussTestCase) {
    return test(`${name} discussion group has the expected content`, async ({page, isMobile}) => {
      await skipToDiscussPhase(page)

      if (isMobile) {
        await page.click('button[aria-label="Toggle the sidebar"]')
      }

      await page.click(`[data-cy=sidebar] div:text("${name}")`)

      if (isMobile) {
        await page.click('button[aria-label="Toggle the sidebar"]')
      }

      for await (const emoji of emojis) {
        await expect(page.locator(`text=${emoji}`)).toBeVisible()
      }

      for await (const task of tasks || []) {
        await expect(page.locator(`[data-cy=task-wrapper] :text('${task}')`)).toBeVisible()
      }

      for await (const comment of comments || []) {
        await expect(page.locator(`[data-cy=comment-wrapper] :text('${comment}')`)).toBeVisible()
      }
    })
  }

  test('it shows the summary window when ending the demo', async ({page}) => {
    await skipToDiscussPhase(page)

    const endDemoButton = page.locator('button :text("End Demo")')
    await expect(endDemoButton).toBeVisible()

    // You end the demo by clicking the "end demo" button twice
    await endDemoButton.click()
    await endDemoButton.click()

    expect(page.url()).toEqual(`${config.rootUrlPath}/retrospective-demo-summary`)
    expect(
      page.locator(
        "text=In just a few seconds you'll have access to run unlimited retrospectives with your team."
      )
    )

    await page.click("[role=button]:text('Create a Free Account')")
    expect(page.url()).toEqual(`${config.rootUrlPath}/create-account?from=demo`)
  })
})
