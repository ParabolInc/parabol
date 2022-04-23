
[![Slack Status](http://slackin.parabol.co/badge.svg)](http://slackin.parabol.co/)

# How to contribute

We founded our company to bring modern, agile ways of working to a broader
diversity of teams. We believe to make differentiated products, you’ve got to be
a different kind of company. That’s one reason why we're developing Parabol
as free open-source from its inception.

Shortly after we began, we announced a program we called “Equity for
Effort” to entice developers outside of our organization to contribute to
the creation of our application in exchange for the possibility of
equity in our company.

You can read our latest blog post on our
[Equity for Effort program here](https://medium.com/parabol-focus/equity-for-effort-v2-0-7ca93e0a3968#.y9upisjz4).

To get started, simply follow these steps:

1. **Find a project:** review the projects listed under the
   “Help Requested” list on the
   [Equity For Effort Projects Board](https://github.com/ParabolInc/parabol/projects/1)
   and select one you're interested in working on.

2. **Bid on it:** leave a comment on the project saying how many points
   you’ll do the project for and we’ll move the project to the “Bid” stage
   (see: [Points and sizes](#points-and-sizes)) – if a project is unclear, you
   can ask for more clarification at this stage

3. **Do it:** once we've received your bid, we'll reach out via email and
   verify you're qualified to participate in the E4E program. When that's
   out of the way we'll accept your bid and move the issue to the
   “Building” stage. You can then go ahead and perform the work. Once you’re
   done, submit a pull request and we'll move the project to the “Reviewing”
   stage.

4. **Collect points:** After the work has been reviewed and merged into the
   source tree, we’ll update our public scoreboard and credit the creator(s)
   with the agreed upon number of points. Once you accrue more than
   100 points we issue options for equity in Parabol, Inc.

## Making changes

- Fork the repository on GitHub.
- Create a feature branch from where you want to base your work (this is usually the master branch).
- Make commits of logical and atomic units.
- Make sure your commit messages are in the proper format.
- Keep the git history as clean as possible (no extra merge commits).
  - Use `git pull --ff-only` or `git pull --rebase` if you are working on some feature branch with someone.
  - Use `git fetch upstream && git merge upstream/master --ff-only` to update the feature branch with the base branch.
- [Submit a pull request](https://github.com/ParabolInc/parabol/pull/new/master) (or PR for short) with a clear list of what you've done.
- Follow the [Code review policy](./docs/codeReview.md):
  - A PR needs to be approved by a Reviewer initially and then by a [Maintainer](./README.md#parabol-maintainers).
  - For the initial review, you can request a review from anyone except for [Maintainers](./README.md#parabol-maintainers).
    - If you use `git blame`, you can see who previously worked on the code that you’re working on. That would be a good person to request an initial review from.
    - Use GitHub mention to notify the reviewer of your choice.
  - Once a Reviewer approves your PR, they’ll request a second review from the [Maintainers](./README.md#parabol-maintainers).
  - If you haven’t heard anything from the reviewer after one week, feel free to ping them again on GitHub.

# Compensation

For giving us a hand and helping the broader Parabol community, your
qualifying contributions may be converted into equity in Parabol Inc. Here’s
how it works:

1. When we've verified your eligibility to participate within the E4E program
   and you've had an issue is merged into the
   [Parabol Inc Repository](https://github.com/ParabolInc/parabol) by
   one of the project maintainers, we’ll tally up the points for your work.

2. We’ll add a row to the
   [Parabol Contributors Scoreboard](https://docs.google.com/spreadsheets/d/1V1KZJn6oKFsqrYwqr430rO3hkIkekSY7oYFzX3cVty4).
   If you’re working as a team, we’ll divide the points among you equally
   unless your team has requested an alternate distribution in the issue
   comments.

3. Once you’ve accumulated more than 100 points, we'll put an Options Grant
   proposal before our Board of Directors to convert your points to options
   in Parabol Inc. (see: [Conversion rate](#conversion-rate)) and issue
   these options to you (subject to board approval). The vesting clock
   will be backdated to the date we received a signature on the consulting
   contract for your first mission.

## Points and sizes

Before you begin working on an issue, you size it. Most issues will have a
*SWAG* sizing from one of the Parabol maintainers, but it’s up to you to
adjust it to what you think is fair.

|  Points  | Individual *or* team effort required |
| -------- | ------------------------------------ |
|    11    | Less than a single day               |
|    12    | One or two days                      |
|    13    | Three or four days                   |
|    15    | Five to seven days                   |
|    18    | Less than two weeks                  |
|    23    | Two to three weeks                   |
|    30    | Three to four weeks                  |
|    50    | Four to eight weeks                  |
|    110   | Too big! Let’s break it down…        |

## Conversion rate

At present, 100 points convert to options for 1,250 shares in Parabol Inc.
With 24,737,564 shares outstanding, that’s roughly 0.005% of the company.

We'll convert for you every time you hit a new 100 point threshold. That is
to say, 200 points, 300 points, and so on.

We currently will reevaluate this conversion rate once per calendar quarter
at our board meeting.

# Community

Want to collaborate? Have questions about our stack?
Join us on our Slack community!

[![Slack Status](http://slackin.parabol.co/badge.svg)](http://slackin.parabol.co/)

Sign up at http://slackin.parabol.co/.

## Questions

If you’ve got questions you'd like to inquire about privately, please don’t
hesitate to reach out. You can reach us at
[love@parabol.co](mailto:love@parabol.co).
