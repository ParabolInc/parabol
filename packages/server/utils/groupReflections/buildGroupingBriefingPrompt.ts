/**
 * Asks for the team briefing that suggested grouping reads. Measured in Nov 2026 against eight
 * rewrites, including ones that ban hedging, list aliases or describe grouping precedents, and none
 * grouped better. Change it only with a measurement behind the change.
 */
const buildGroupingBriefingPrompt = (roster: string[], history: string) =>
  `Below is everything one team wrote in its retrospectives over the last six months: the cards (reflections) people wrote under each prompt, how the team grouped them, the votes each group got, and the comments and tasks from discussing them.

Write a background briefing for another AI that will group this team's NEXT retrospective. That AI sees only the new cards, so it cannot tell that "the migration", "Project Falcon", "the ops team" and "FMS" may all be the same thing, or who "Dana" is. Your briefing gives it the team knowledge a long-time member would have.

Include as much team-specific detail as is useful, in plain prose and short lists:
- People: who is on the team and who they mention (names, roles, which work they own), as far as the material shows.
- Products, projects, systems, tools, customers, vendors and other teams the cards mention, and which names refer to the same thing.
- Acronyms and jargon, with their meanings.
- Company or team goals, deadlines and initiatives the team is working towards.
- Recurring themes and long-running problems, and how they are usually phrased.
- How this team groups cards: what it treats as one topic, how big its groups tend to be, whether it groups across prompts, and any habits (for example, all shout-outs in one group, or one group per project).

Be specific and factual; use only what the material supports. Do not describe individual cards or list the past groups one by one, and never say who wrote a card. Keep it under 700 words.

Current team members: ${roster.join(', ') || 'unknown'}

${history}`

export default buildGroupingBriefingPrompt
