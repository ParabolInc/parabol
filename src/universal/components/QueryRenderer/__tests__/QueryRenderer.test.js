import clientSocket from 'client/__mocks__/clientSocket';
import Atmosphere from 'universal/Atmosphere';
import {shallow} from 'enzyme';
import React from 'react';
import QueryRenderer from '../QueryRenderer';

QueryRenderer._fetch = jest.fn();

const query = () => ({
  fragment: {
    argumentDefinitions: [],
    kind: 'Fragment',
    metadata: null,
    name: 'GitHubIntegrationsRootQuery',
    selections: [
      {
        kind: 'LinkedField',
        alias: null,
        args: null,
        concreteType: 'User',
        name: 'viewer',
        plural: false,
        selections: [
          {
            kind: 'ScalarField',
            alias: null,
            args: null,
            name: 'preferredName',
            storageKey: null
          }
        ],
        storageKey: null
      }
    ],
    type: 'Query'
  },
  id: null,
  kind: 'Batch',
  metadata: {},
  name: 'GitHubIntegrationsRootQuery',
  query: {
    argumentDefinitions: [],
    kind: 'Root',
    name: 'GitHubIntegrationsRootQuery',
    operation: 'query',
    selections: [
      {
        kind: 'LinkedField',
        alias: null,
        args: null,
        concreteType: 'User',
        name: 'viewer',
        plural: false,
        selections: [
          {
            kind: 'ScalarField',
            alias: null,
            args: null,
            name: 'preferredName',
            storageKey: null
          },
          {
            kind: 'ScalarField',
            alias: null,
            args: null,
            name: 'id',
            storageKey: null
          }
        ],
        storageKey: null
      }
    ]
  },
  text: 'query GitHubIntegrationsRootQuery {\n  viewer {\n    preferredName\n    id\n  }\n}\n'
});

const sub = () => ({
  fragment: {
    argumentDefinitions: [
      {
        kind: 'LocalArgument',
        name: 'teamId',
        type: 'ID!',
        defaultValue: null
      }
    ],
    kind: 'Fragment',
    metadata: null,
    name: 'GitHubRepoRemovedSubscription',
    selections: [
      {
        kind: 'LinkedField',
        alias: null,
        args: [
          {
            kind: 'Variable',
            name: 'teamId',
            variableName: 'teamId',
            type: 'ID!'
          }
        ],
        concreteType: 'RemoveGitHubRepoPayload',
        name: 'githubRepoRemoved',
        plural: false,
        selections: [
          {
            kind: 'ScalarField',
            alias: null,
            args: null,
            name: 'deletedId',
            storageKey: null
          }
        ],
        storageKey: null
      }
    ],
    type: 'Subscription'
  },
  id: null,
  kind: 'Batch',
  metadata: {},
  name: 'GitHubRepoRemovedSubscription',
  query: {
    argumentDefinitions: [
      {
        kind: 'LocalArgument',
        name: 'teamId',
        type: 'ID!',
        defaultValue: null
      }
    ],
    kind: 'Root',
    name: 'GitHubRepoRemovedSubscription',
    operation: 'subscription',
    selections: [
      {
        kind: 'LinkedField',
        alias: null,
        args: [
          {
            kind: 'Variable',
            name: 'teamId',
            variableName: 'teamId',
            type: 'ID!'
          }
        ],
        concreteType: 'RemoveGitHubRepoPayload',
        name: 'githubRepoRemoved',
        plural: false,
        selections: [
          {
            kind: 'ScalarField',
            alias: null,
            args: null,
            name: 'deletedId',
            storageKey: null
          }
        ],
        storageKey: null
      }
    ]
  },
  text: 'subscription GitHubRepoRemovedSubscription(\n  $teamId: ID!\n) {\n  githubRepoRemoved(teamId: $teamId) {\n    deletedId\n  }\n}\n'
});

describe('ReactRelayQueryRenderer', () => {
  // let TestQuery;
  // let cacheConfig;
  let environment;
  let render;
  // let store;
  let variables;
  beforeEach(() => {
    jest.resetModules();
    // expect.extend({
    //  toBeRendered(readyState) {
    //    const calls = render.mock.calls;
    //    expect(calls.length).toBe(1);
    //    expect(calls[0][0]).toEqual(readyState);
    //    return {pass: true};
    //  },
    // });
    environment = new Atmosphere();
    environment.setSocket(clientSocket);

    // store = environment.getStore();
    render = jest.fn(() => <div />);
    variables = {teamId: 1};
  });

  describe('all', () => {
    it('on mount, calls subscribe, sets unsubscribe, creates a querySub record', () => {
      const Sub = jest.fn(() => ({subscription: sub, variables}));
      const subscriptions = [Sub];
      const wrapper = shallow(
        <QueryRenderer
          query={query}
          environment={environment}
          render={render}
          variables={variables}
          subscriptions={subscriptions}
        />
      );
      const instance = wrapper.instance();

      expect(instance.unsubscribe).toBeDefined();
      expect(environment.querySubscriptions.length).toBe(1);
    });

    it('on unmount, it does not release if subscriptions are provided', () => {
      const Sub = jest.fn(() => ({subscription: sub, variables}));
      const subscriptions = [Sub];
      const wrapper = shallow(
        <QueryRenderer
          query={query}
          environment={environment}
          render={render}
          variables={variables}
          subscriptions={subscriptions}
        />
      );
      wrapper.unmount();
      expect(environment.querySubscriptions.length).toBe(1);
    });

    it('on unmount, it does release if subscriptions are not provided', () => {
      const wrapper = shallow(
        <QueryRenderer
          query={query}
          environment={environment}
          render={render}
          variables={variables}
        />
      );
      wrapper.unmount();
      expect(environment.querySubscriptions.length).toBe(0);
    });
  });
});
