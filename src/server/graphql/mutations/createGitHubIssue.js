import {convertFromRaw} from 'draft-js';
import {stateToMarkdown} from 'draft-js-export-markdown';
import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {getUserId, requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import {GITHUB} from 'universal/utils/constants';
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
    if (project.integration && project.integration.service) {
      throw new Error(`That project is already linked to ${project.integration.service}`);
    }
    const [repoOwner, repoName] = nameWithOwner.split('/');
    if (!repoOwner || !repoName) {
      throw new Error(`${nameWithOwner} is not a valid repository`);
    }

    // RESOLUTION
    const {teamMemberId: assignee, content: rawContentStr} = project;
    const [assigneeUserId] = assignee.split('::');
    const providers = await r.table('Provider')
      .getAll(teamId, {index: 'teamIds'})
      .filter({service: GITHUB});
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
    const {blocks} = rawContent;
    let {text: title} = blocks[0];
    // if the title exceeds 256, repeat it in the body because it probably has entities in it
    if (title.length <= 256) {
      blocks.shift();
    } else {
      title = title.slice(0, 256);
    }
    const contentState = convertFromRaw(rawContent);
    let body = stateToMarkdown(contentState);
    if (!creatorProvider) {
      const creatorName = await r.table('User').get(userId)('preferredName');
      body = `${body}\n\n_Added by ${creatorName}_`;
    }
    const payload = {
      title,
      body,
      assignees: [assigneeProvider.providerUserName]
    };
    console.log('payload to GH', payload)
    const {accessToken} = creatorProvider || assigneeProvider;
    const postOptions = makeGitHubPostOptions(accessToken, payload);
    const endpoint = `https://api.github.com/repos/${repoOwner}/${repoName}/issues`;
    const newIssue = await fetch(endpoint, postOptions);
    const res = await newIssue.json();
    console.log('res', res);
    const {errors, message} = res;
    if (errors) {
      const {code, field} = errors[0];
      if (code === 'invalid') {
        if (field === 'assignees') {
          const assigneeName = await r.table('TeamMember').get(assignee)('preferredName');
          throw new Error(`${assigneeName} cannot be assigned to ${nameWithOwner}. Make sure they have access`);
        }
      }
      throw new Error(`GitHub: ${field} ${code}.${message}`);
    } else if (message) {
      // this means it's our bad:
      throw new Error(`GitHub: ${message}.`);
    }

    const {number: issueNumber, id: integrationId} = res;
    await r.table('Project').get(projectId)
      .update({
        integration: {
          integrationId,
          service: GITHUB,
          issueNumber,
          nameWithOwner
        }
      });

    return true;
  }
};
