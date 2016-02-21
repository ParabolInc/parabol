
[![Slack Status](http://slackin.parabol.co/badge.svg)](http://slackin.parabol.co/)

# How to contribute

Action is software built with the community for the community. At
[Parabol](http://parabol.co), we believe a significant step toward a better
workplace is to support individuals and teams to:

* Develop a clear picture of what they’re accountable for,
* Clear blockages in projects, and
* See and celebrate progress.

We’re a young organization, and we won’t be able to develop this software
and realize this vision without your help.

However, we also believe that contributing to Action _isn’t_ its own reward.
That’s why we’re offering equity compensation for designers and coders who
contribute to Action. We were influenced by
[18F’s Open Source Micro-Purchasing model](https://18f.gsa.gov/2015/10/13/open-source-micropurchasing/).

Here’s how contributing to Action works.


# Find an Issue

Whether you’re a designer or a developer, we could use a hand.

All of the development work for Action is captured as an issue on Github
issues. To see which issues are available for you to help with, have a look
at our [waffle.io board](https://waffle.io/ParabolInc/action).

All Issues begin in our *Backlog*. Consider these a list of things we _could_
do but aren’t actively looking to develop yet. Issues ready for contribution
appear in *Needs Design Spec* or *Ready for Build*.

## If you’re a designer

![Contributing to Action - Designers](./docs/images/ContributingToActionDesigners.png)

Whether helping us develop a new spinner or rethinking the UX of our on-boarding flow, we could use your talent.

Here’s how to get involved:

1. [Look at Action’s waffle.io board](https://waffle.io/ParabolInc/action)
   and find an issue from the *Needs Design Spec* column.

2. Click on the issue number and read the comments. Inside you’ll find a
   link to the issue’s *mission spec* which details the work to be done.

3. If you’re interested in taking the mission, add a comment to it and
   tell us how many points you’re interested in doing the job for
   (see: [Compensation](#compensation)). We’ll acknowledge that the issue
   now belongs to you and move it to the *Designing* column.

4. Contribute your work along the guidelines in the mission spec. Once you’re
   done add a comment to the issue. We’ll look over your work and provide
   feedback.

5. Once any feedback is addressed, we’ll assign you points to compensate you
   for your work, and grant you our eternal thanks!

## If you’re a coder

![Contributing to Action - Developers](./docs/images/ContributingToActionCoders.png)

Tired of that crusty old PHP codebase at the office? In school and wish you
could contribute to a real project? Join us!

Contributing is easy:

### If it’s an enhancement

1. [Look at Action’s waffle.io board](https://waffle.io/ParabolInc/action)
   and find an issue from the *Ready for Build* column.

2. Click on the issue number and read the comments. Inside you’ll find a
   link to the issue’s *mission spec* detailing the work and optional
   *design spec* if the work has an associated UX design.

3. If you’re interested in taking the mission, add a comment to it and
   tell us how many points you’re interested in doing the job for
   (see: [Compensation](#compensation)). We’ll acknowledge that the issue
   now belongs to you and move it to the *Building* column.

4. Create a branch named similarly to `feature-name-#issue` where `#issue`
   is the GitHub issue number (e.g. `timer-feature-#42`).

5. Contribute your work along the guidelines provided in the spec documents.
   Once you’re done, add a comment to the issue. We’ll look over your work,
   and provide feedback.

6. Once any feedback is addressed, we’ll assign you points to compensate you
   for your work, and grant you our eternal thanks!

### If it’s a bug

1. Submit the bug as a
   [new GitHub issue](https://github.com/ParabolInc/action/issues).

2. If you’re interested in fixing it, tell us how many points you think it’s
   worth (see: [Compensation](#compensation)).

3. Add a comment to the issue telling us that you’ve got it, we’ll
   acknowledge it by moving the issue to the *Building* column on
   [Action’s waffle.io board](https://waffle.io/ParabolInc/action).

4. Create a branch named similarly to `bugfix-description-#issue` where
   `#issue` is the GitHub issue number (e.g. `bugfix-authentication-#43`).

4. Submit the PR with the fix.

5. Once any feedback is addressed, we’ll assign you points to compensate you
   for your work, and grant you our eternal thanks!


# Points and sizes

Before you begin working on an issue, you size it. Most issues will have a
*swag* sizing from one of the Action maintainers, but it’s up to you to
adjust it to what you think is fair.

|  Points  | Individual *or* team effort required |
| -------- | ------------------------------------ |
|    1     | Less than a single day               |
|    2     | One or two days                      |
|    3     | Three or four days                   |
|    5     | Five to seven days                   |
|    8     | Less than two weeks                  |
|    13    | Two to three weeks                   |
|    20    | Three to four weeks                  |
|    40    | Four to eight weeks                  |
|    100   | Too big! Let’s break it down…        |


# Compensation

For giving us a hand and helping the broader Action community your
contributions can be converted into equity in Parabol Inc. Here’s how it
works:

1. When an issue is merged into the
   [Parabol Inc Action Repository](https://github.com/ParabolInc/action) by
   one of the project maintainers, we’ll tally up the points for your work.
   **Every merged issue scores 10 points + its size.**

2. We’ll add a row to the
   [Parabol Action Contributors Scoreboard](https://docs.google.com/spreadsheets/d/1V1KZJn6oKFsqrYwqr430rO3hkIkekSY7oYFzX3cVty4).
   If you’re working as a team, we’ll divide the points among you equally
   unless your team has requested an alternate
   distribution in the issue comments.

3. Once you’ve accumulated more than 100 points, we’ll send you an advisory
   agreement offering to convert your points to options in Parabol Inc.
   (see: [Conversion rate](#conversion-rate)). The vesting clock will be
   backdated to the date your *first* pull request was merged into the Action
   repository.

4. Once we’ve received your signed advisory agreement, we’ll issue you options
   for equity in Parabol Inc. along their vesting schedule. If you continue to
   accrue points by contributing, we’ll amend your advisory agreement no
   less frequently than once per quarter.

## Conversion rate

At present, 100 points convert to options for 10,000 shares in Parabol Inc.
With 10,000,000 shares outstanding, that’s 0.1% of the company.

We currently will reevaluate this conversion rate once per calendar quarter
during our board meeting.

## Questions

If you’ve got questions, please don’t hesitate to reach out. You can
always reach us at [love@parabol.co](mailto:love@parabol.co)


# Mission specs

Mission specs are brief definitions of design or engineering work. They
answer a few vital questions to frame in the job to be done including:

  * Why is this work important?
  * Which user(s) does it serve?
  * What’s the primary journey or experience?
  * Which skills are needed to do the work?
  * What quantitative and qualitative metrics can we measure?
  * How many points do we think the work is worth?

The official Action mission template document can be found
[here](https://goo.gl/mB32GD)

# Design specs

Some GitHub issues require a design spec in addition to a mission spec.
Design specs are needed when a particular mission is complicated enough
that a more in-depth written description, series of diagrams, or prototype is necessary to communicate intent.

There are no specific requirements for how to create a design, but some
examples we like are:

   * UI/UX
     * A series of still images depicting the primary journey
     * A clickable prototype, constructed in a tool such as
       [InVision](http://www.invisionapp.com/)
     * A coded front-end prototype, perhaps branched directly from the
       Action source repository
     * A screencast with talking track
     * Or even an animated gif, like so:

    ![Example animated gif design spec](./docs/images/DesignSpecExample.gif)

Simply attach your design spec to the GitHub issue and we’ll give you
feedback.

# Community

Questions? Want to collaborate? Come join us on our Slack community.

[![Slack Status](http://slackin.parabol.co/badge.svg)](http://slackin.parabol.co/)

Sign up at http://slackin.parabol.co/
