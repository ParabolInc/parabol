import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {getUserId, requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import {stateToMarkdown} from 'draft-js-export-markdown';
import {convertFromRaw} from 'draft-js';
import makeGitHubPostOptions from 'universal/utils/makeGitHubPostOptions';

export default {
  name: 'CreateGitHubIssue',
  type: GraphQLBoolean,
  args: {
    projectId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the project to convert to a GH issue'
    },
    nameWithOwner: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The owner/repo string'
    }
  },
  resolve: async (source, {nameWithOwner, projectId}, {authToken, socket}) => {
    const r = getRethink();

    // AUTH
    const [teamId] = projectId.split('::');
    requireSUOrTeamMember(authToken, teamId);
    requireWebsocket(socket);

    // VALIDATION
    const userId = getUserId(authToken);
    const project = await r.table('Project').get(projectId);
    if (!project) {
      throw new Error('That project no longer exists');
    }
    const [repoOwner, repoName] = nameWithOwner.split('/');
    if (!repoOwner || !repoName) {
      throw new Error(`${nameWithOwner} is not a valid repository`);
    }
    // RESOLUTION
    const {teamMemberId: assignee, content: rawContentStr} = project;
    const [assigneeUserId] = assignee.split('::');
    const providers = await r.table('Provider')
      .getAll(teamId, {index: 'teamIds'});
    const assigneeProvider = providers.find((provider) => provider.userId === assigneeUserId);
    if (!assigneeProvider) {
      const assigneeName = await r.table('TeamMember').get(assignee)('preferredName');
      throw new Error(`Assignment failed! Ask ${assigneeName} to add GitHub in Team Settings`);
    }

    const creatorProvider = providers.find((provider) => provider.userId === userId);

    if (!rawContentStr) {
      throw new Error('You must add some text before submitting a project to github');
    }
    const rawContent = JSON.parse(rawContentStr);
    const {text: title} = rawContent.blocks.shift();
    const contentState = convertFromRaw(rawContent);
    let body = stateToMarkdown(contentState);
    if (!creatorProvider) {
      const creatorName = await r.table('User').get(userId)('preferredName');
      body = `${body}
      
      _Added by ${creatorName}_`
    }
    const payload = {
      title,
      body,
      assignees: [assigneeProvider.providerUserName]
    };
    const {accessToken} = creatorProvider || assigneeProvider;
    const postOptions = makeGitHubPostOptions(accessToken, payload);
    const endpoint = `https://api.github.com/repos/${repoOwner}/${repoName}/issues`;
    const newIssue = await fetch(endpoint, postOptions);
    const res = await newIssue.json();
    return true;
  }
};
