## Manual Testing Guide
For non-developing team members to conduct successful manual testing of the platform.

## Mission
* Work with developers
* Test new features and updates
* Test the weekly release candidates

## How to Get the Job Done
### 01) Overview
Comment observations in GitHub issues that you are working on. If the issue is new or needs special attention, create a new issue for it.

There are three working environments:

* [Production environment](https://action.parabol.co/): This is where the last release with no release-blocking features is live.
* [Staging environment](https://action-staging.parabol.co/): This is a sandbox environment before production goes live.
* Local environment: Configured in your machine (localhost). Local testing of new features/updates.

How to Get Started

* Seek to understand the working culture and expectations.
* Go through the Parabol [website](https://www.parabol.co/) to have a clear understanding of the product, features and functionality.
* Run the Practice Round demo to learn how Parabol works and what the usecases are.
* Test Parabol in the production environment using our [release test guide](https://github.com/ParabolInc/parabol/issues/6155#issue-1157867836). This will help you to understand normal application behavior and to identify blocking & non-blocking features for future release candidates.

### 02) Testing New and/or Updated Features
There is a periodic sprint plan for updating and creating new features of which can be found in the [sprint board](https://github.com/orgs/ParabolInc/projects/1). The following sections of the board should be tested in the order of:

1. Maintainer Review
2. Reviewer Review
3. Self-Review (Ask the developer if issue is ready for testing)

New features/updates/fixes are tested in your local environment. With docker running open your terminal. Use git pulls to ensure your local repo is up-to-date and use git switch to get the branch you want to test. When you have your testing branch ready run the following commands:
* yarn
* yarn db:start
* yarn dev

To test the new feature or update, load your web browser and goto localhost:3000.

**_TIP: Trace the respective branch where the changes on the issue are pushed by the developer. Pull it, test and comment if expected behavior is there._**

### 03) Release Testing
Release tests are completed through the staging environment and are done weekly (Tues/Weds depending on your timezone). The purpose of these is to identify issues that can block the release. For each release one developer(release-owner) is responsible and will create a release test issue. Testers will be notified when the staging environment is ready for testing. Use the [release test guide](https://github.com/ParabolInc/parabol/issues/6155#issue-1157867836) as a template for testing. Copy the release test checklist directly into the release test thread as a comment and check each box as they are completed. Comment on any unexpected or unwanted behaviors. Running live demos of the current release from production will help you to identify any unexpected behavior(s) that may show up in the release tests.

* Release Blocking features/issues: Decided by the release owner.

* Release Non-Blocking features/issues: Unexpected behaviors in the current release and the production environment.

**_NOTE: If a bug is found, check issues on github to see if an issue has been created for it. If no issue exists then create one with steps to reproduce the bug._**

## Good Testing Practice
* Be familiar with the application and its latest features
* Understand how the application should behave normally via production level testing
* Release testing done in the staging environment
* Feature/update testing done in the local env
* If you don't know how to proceed with a test, ask for help

## Tips for Success
* Communication 
   
  Effective remote working requires active communication. You will be connected to the Parabol **slack group** where you can ask for help or clarification with any problems you may be having. If you're unsure about anything this is a good place to ask. Its also a great place to get to know your teammates.
* Timing

  Developers are working according to the sprint plan and changes are updated regularly in the [sprint board](https://github.com/orgs/ParabolInc/projects/1). You need to check regularly on changes and test the issue if it requires testing. If you are not clear on how to test, ask by commenting on the issue.
