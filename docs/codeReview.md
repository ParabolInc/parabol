# Code review policy

The goal is to help reviewers to make their intentions clear to the author and for the author to know exactly what is expected of them to pass the next review round.
Review progress is tracked in the [Sprint Board](https://github.com/orgs/ParabolInc/projects/1) by the issue the PR belongs to.
If there is no issue belonging to the PR, then the PR itself should be added to the board.
A PR advances from self-review to reviewer-review and finally maintainer review before it can get merged.

## General rules

- Once you're assigned to a task, it's your responsibility to split it the way you can submit reasonably sized PRs. It’s ok to have multiple PRs for a single issue.
- Use draft PRs to ask for early feedback.
- It should be a reviewer’s goal to do the code review within 1 business day. If you’re unable to do it, leave a comment.
- If you’re busy it’s ok to assign someone else as a reviewer.
- When submitting a PR, provide context. What's the task? What's changed? Why? If you can, record a Loom to share why things are done that way. It'll be easier for a reviewer to understand what decision you've made and why.
- When reviewing a PR and requesting changes, be mindful that the PR author won't always have the right background to understand what are you requesting. Make your comments meaningful, and record a Loom if needed.
- [The right balance](https://docs.gitlab.com/ee/development/code_review.html#the-right-balance)

## Reviewer

- Prefix each comment with a label. The labels are not points and will not be summed up or similar.
    - -2 there is a fundamental design issue
    e.g. change will crash, high impact performance, high impact on maintainability
    - -1 please fix this
    e.g. naming of variable is misleading, coupling of components can be reduced, code is hard to understand
    - +1 I would do it differently
      - inconsequential enough to not need another review
      - some suggestion for the authors consideration, e.g. better variable name, alternative split of components
      - refactoring of existing code, e.g. While you're in here, could you fix xyz?
    - +2 kudos
    e.g. nice work here, I learnt something, good find
- Final review is "Approve" if there are no negative comments, otherwise "Request changes"
    - Changes requested? Move the issue associated with the PR to the self-review column.
    - Approved? Move the associated issue to maintainer-review.

## Maintainer

- Maintainer follows the same process of Reviewers
- Approved by the maintainer?
  - If there are +1 comments, the issue the PR belongs to goes back to self-review to give the author a chance to react to the comments.
  - If there are only +2 comments, the PR can be merged directly by the maintainer.

## Author

- Answer or resolve each comment
    - resolve if you followed the suggestion
    - reply if you didn't
- If you need to clarify parts of the code, check if it can be done by adding comments or improve naming of variables/functions/classes
- When you replied or resolved all comments, move issue back to reviewer- or maintainer-review
