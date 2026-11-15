export const SEED_TASK_TEXT = `This is a task card. They can be created here, in a meeting, or via an integration`
export const SEED_INTEGRATIONS_TASK_TEXT = `Parabol supports integrations for Jira, GitHub, GitLab, Slack and Mattermost. Connect your tools in Settings > Integrations.`

const isSeedTask = ({plaintextContent}: {readonly plaintextContent: string}) =>
  plaintextContent === SEED_TASK_TEXT || plaintextContent === SEED_INTEGRATIONS_TASK_TEXT

export default isSeedTask
