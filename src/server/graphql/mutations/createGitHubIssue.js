import {convertFromRaw} from 'draft-js';
import {stateToMarkdown} from 'draft-js-export-markdown';
import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {getUserId, requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import {GITHUB} from 'universal/utils/constants';
import makeGitHubPostOptions from 'universal/utils/makeGitHubPostOptions';

// const checkCreatorPermission = async (nameWithOwner, adminProvider, creatorProvider) => {
//  if (!creatorProvider) return false;
//  const {providerUserName: creatorLogin, userId: creatorUserId} = creatorProvider;
//  const {accessToken: adminAccessToken, userId: adminUserId} = adminProvider;
//  if (adminUserId === creatorUserId) return true;
//  const endpoint = `https://api.github.com/repos/${nameWithOwner}/collaborators/${creatorLogin}/permission`;
//  const res = await fetch(endpoint, {headers: {Authorization: `Bearer ${adminAccessToken}`}});
//  const resJson = await res.json();
//  const {permission} = resJson;
//  return permission === 'admin' || permission === 'write';
// };

const makeAssigneeError = async (res, assigneeTeamMemberId, nameWithOwner) => {
  const r = getRethink();
  const {errors, message} = res;
  if (errors) {
    const {code, field} = errors[0];
    if (code === 'invalid') {
      if (field === 'assignees') {
        const assigneeName = await r.table('TeamMember').get(assigneeTeamMemberId)('preferredName');
        throw new Error(`${assigneeName} cannot be assigned to ${nameWithOwner}. Make sure they have access`);
      }
    } else if (code === 'missing_field') {
      if (field === 'title') {
        throw new Error('The first line is the title. It can’t be empty');
      }
    }
    throw new Error(`GitHub: ${message}. ${code}: ${field}`);
  } else if (message) {
    // this means it's our bad:
    throw new Error(`GitHub: ${message}.`);
  }
};

export default {
  name: 'CreateGitHubIssue',
  type: GraphQLBoolean,
  args: {
    taskId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the task to convert to a GH issue'
    },
    nameWithOwner: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The owner/repo string'
    }
  },
  resolve: async (source, {nameWithOwner, taskId}, {authToken, socket}) => {
    const r = getRethink();
    const now = new Date();

    // AUTH
    const [teamId] = taskId.split('::');
    requireSUOrTeamMember(authToken, teamId);
    requireWebsocket(socket);

    // VALIDATION
    const userId = getUserId(authToken);
    const task = await r.table('Task').get(taskId);
    if (!task) {
      throw new Error('That task no longer exists');
    }
    if (task.integration && task.integration.service) {
      throw new Error(`That task is already linked to ${task.integration.service}`);
    }
    const [repoOwner, repoName] = nameWithOwner.split('/');
    if (!repoOwner || !repoName) {
      throw new Error(`${nameWithOwner} is not a valid repository`);
    }
    const adminUserId = await r.table(GITHUB)
      .getAll(nameWithOwner, {index: 'nameWithOwner'})
      .filter({isActive: true, teamId})
      .nth(0)('adminUserId')
      .default(null);

    if (!adminUserId) {
      throw new Error(`No integration for ${nameWithOwner} exists for ${teamId}`);
    }

    // RESOLUTION
    const {teamMemberId: assigneeTeamMemberId, content: rawContentStr} = task;
    const [assigneeUserId] = assigneeTeamMemberId.split('::');
    const providers = await r.table('Provider')
      .getAll(teamId, {index: 'teamId'})
      .filter({service: GITHUB, isActive: true});
    const assigneeProvider = providers.find((provider) => provider.userId === assigneeUserId);
    if (!assigneeProvider) {
      const assigneeName = await r.table('TeamMember').get(assigneeTeamMemberId)('preferredName');
      throw new Error(`Assignment failed! Ask ${assigneeName} to add GitHub in Team Settings`);
    }
    const adminProvider = providers.find((provider) => provider.userId === adminUserId);
    if (!adminProvider) {
      // this should never happen
      throw new Error('This repo does not have an admin! Please re-integrate the repo');
    }

    const creatorProvider = providers.find((provider) => provider.userId === userId);

    if (!rawContentStr) {
      throw new Error('You must add some text before submitting a task to github');
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
    const {accessToken} = creatorProvider || assigneeProvider;
    const postOptions = makeGitHubPostOptions(accessToken, payload);
    const endpoint = `https://api.github.com/repos/${repoOwner}/${repoName}/issues`;
    const newIssue = await fetch(endpoint, postOptions);
    const newIssueJson = await newIssue.json();
    try {
      await makeAssigneeError(newIssueJson, assigneeTeamMemberId, nameWithOwner);
    } catch (e) {
      throw e;
    }
    const {id: integrationId, assignees, number: issueNumber} = newIssueJson;
    if (assignees.length === 0) {
      const {accessToken: adminAccessToken} = adminProvider;
      const patchEndpoint = `https://api.github.com/repos/${nameWithOwner}/issues/${issueNumber}`;
      const assignedIssue = await fetch(patchEndpoint, {
        method: 'PATCH',
        headers: {Authorization: `token ${adminAccessToken}`},
        body: JSON.stringify({assignees: payload.assignees})
      });
      const assignedIssueJson = await assignedIssue.json();
      try {
        await makeAssigneeError(assignedIssueJson, assigneeTeamMemberId, nameWithOwner);
      } catch (e) {
        throw e;
      }
    }

    await r.table('Task').get(taskId)
      .update({
        integration: {
          integrationId,
          service: GITHUB,
          issueNumber,
          nameWithOwner
        },
        updatedAt: now
      });

    return true;
  }
};
