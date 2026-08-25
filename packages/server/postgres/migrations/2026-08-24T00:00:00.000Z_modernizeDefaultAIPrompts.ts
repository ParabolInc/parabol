import type {Kysely} from 'kysely'

// The seeded prompts were written for gpt-4-era models, so they leaned on persona priming
// ("You are an expert in...") and anti-preamble hacks ("No yapping", "Try for about 300 words").
// A reasoning model needs none of that; what it can act on is a hard scope, a firm word budget,
// and permission to say the data is too thin rather than inventing a finding.
const PROMPTS = [
  {
    title: 'Wins, Challenges, and Recommendations',
    content: `Report on this data under three headings: **Wins**, **Challenges**, and **Recommendations**.

Cover the most significant completed work, the biggest obstacles the team hit, and any pattern that recurs across meetings — repeated blockers, shared frustrations, or strategies that worked. Ground every point in specific evidence from the data. Make each recommendation a concrete next step, not a general principle.

Start with the first heading.`,
    previousContent: `You are an expert in agile retrospectives and project management.

Analyze this data and provide key insights on:
- The most significant **wins** in terms of completed work, team collaboration, or project improvements.
- The biggest **challenges** faced by the team.
- Any **trends** in the conversations (e.g., recurring blockers, common frustrations, or successful strategies).
- Suggestions for improving efficiency based on the data.

Use a structured response format with **Wins**, **Challenges**, and **Recommendations**. No yapping. No introductory sentence.`
  },
  {
    title: 'Psychological Safety & Team Dynamics',
    content: `Assess psychological safety across these meetings. Look for whether concerns get raised directly or hedged, whose voices dominate, and who stays quiet. Say so plainly where the data is too thin to judge.

Explain how those dynamics are shaping the team's decisions, then give specific steps to widen participation. Under 300 words.`,
    previousContent: `Analyze the retrospective discussions, sprint poker meetings, and daily standups to assess the level of psychological safety within the teams. Identify signs of open communication, hesitancy in raising concerns, and patterns of dominant voices versus silent participants. Provide insights on how team dynamics influence decision-making and suggest actionable steps to improve collaboration and inclusivity. No yapping. Try for about 300 words.`
  },
  {
    title: 'Sprint Predictability & Estimation Accuracy',
    content: `Compare the team's poker estimates against what actually got completed. Identify where they consistently under- or over-estimate, and judge whether spillover points to scope creep, bottlenecks, or blockers. Separate real patterns from one-off sprints.

Recommend specific changes to improve predictability. Under 300 words.`,
    previousContent: `Evaluate how well our sprint planning aligns with actual execution by analyzing the consistency of our sprint poker estimates versus completed work. Identify patterns where underestimation or overestimation is common, and assess whether work spillover trends indicate scope creep, bottlenecks, or blockers. Provide recommendations to improve sprint predictability and estimation accuracy. No yapping. Try for about 300 words.`
  },
  {
    title: 'Sentiment & Morale Trends Over Time',
    content: `Track how the team's morale and stress levels shift across these meetings, quoting the language that signals each shift. Correlate any change with workload, sprint outcomes, or events visible in the data, and say when a correlation is too weak to call.

Close with specific ways to improve engagement. Under 300 words.`,
    previousContent: `Perform a sentiment analysis of the team's discussions during retrospectives, standups, and sprint poker meetings. Identify changes in morale, motivation, and stress levels over the past three months. Highlight any correlations between team sentiment and sprint outcomes, workload, or external factors. Provide insights on how to boost team morale and engagement. No yapping. Try for about 300 words.`
  }
]

const setContent = async (db: Kysely<any>, prompts: {title: string; content: string}[]) => {
  await Promise.all(
    prompts.map(({title, content}) =>
      db
        .updateTable('AIPrompt')
        .set({content})
        .where('userId', '=', 'aGhostUser')
        .where('title', '=', title)
        .execute()
    )
  )
}

export async function up(db: Kysely<any>): Promise<void> {
  await setContent(db, PROMPTS)
}

export async function down(db: Kysely<any>): Promise<void> {
  await setContent(
    db,
    PROMPTS.map(({title, previousContent}) => ({title, content: previousContent}))
  )
}
