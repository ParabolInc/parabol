# Code review policy

The goal is to help reviewers to make their intentions clear to the author and for the author to know exactly what is expected of them to pass the next review round.
Review progress is tracked in the [Sprint Board](https://github.com/orgs/ParabolInc/projects/1) by the issue the PR belongs to.
If there is no issue belonging to the PR, then the PR itself should be added to the board.
A PR advances from self-review to reviewer-review and finally maintainer review before it can get merged.

## Submitting a PR

- Once you're assigned to a task, it's your responsibility to split it the way you can submit reasonably sized PRs. It’s ok to have multiple PRs for a single issue.
- Use draft PRs to ask for early feedback.
- When submitting a PR, provide context. What's the task? What's changed? Why? If you can, record a Loom to share why things are done that way. It'll be easier for a reviewer to understand what decision you've made and why.

## Requesting Code Reviews

- Self-assess which domains are involved in the changes made by your PR, find a reviewer from among the folks who fill the [Code Reviewer (L2–3)](https://www.notion.so/Code-Reviewer-L2-3-a47bb0759a0b41b5b0469ff14a8cdaae) role, paying specific attention to who GitHub suggests, who has indicated expertise within a domain (e.g. backend, front-end, etc.), and who has capacity to review within 24 hours.
- If the PR has not been reviewed within 24 hours, send a reminder to Slack or request a review from another reviewer or group of reviewers, or consider adding an agenda item to the [Parabol – Product](https://www.notion.so/Parabol-Product-1065acffc95d4f64a71b7808bad98ff5) check-in meeting
- If the developer creating the PR feels that maintainer review isn't necessary, they should add a label: “One Review Required”. Use the label for PRs of any size and complexity If you are confident enough, and it feels safe. One exception: we should be extremely careful with DB migrations as they might break the application in the way that is hard to restore.

## Doing Code Reviews

- Doing code reviews and unblocking others is also important part of your job. It is totally fine that sometimes you may do more PR reviews than coding.
- Prioritize unblocking others by doing [code reviews](https://github.com/pulls/review-requested) on daily basis
- Try to complete PR reviews within 1 working day
- If not possible to complete PR review within 1 working day, follow the above “Requesting Code Reviews” guide to reassign the PR
- If the review requested from a group of people, indicate that you are doing review by assigning a PR to yourself or in a comment.
- When reviewing a PR and requesting changes, be mindful that the PR author won't always have the right background to understand what are you requesting. Make your comments meaningful, and record a Loom if needed.
- [The right balance](https://docs.gitlab.com/ee/development/code_review.html#the-right-balance)

## Sprint Board

- Issues can go in these columns: To Prioritize, Backlog, To Do, In Progress, Stuck.
- Pull Requests can go in these columns: Stuck, Self Review, Reviewer Review, Maintainer Review.
- A PR may correpsond to 0 or many issues. These issues shall stay "In Progress" and when the PR gets merged, they'll be moved to "Done" automatically.
- The motivation for this structure is to relax the constraint that 1 issue has 1 PR. If a PR resolves 3 issues, we only have to update the status of the PR, not update all 3 issues as a group. If a PR fails to resolve 1 of the 3 issues, the remaining issue stays "In Progress" instead of being moved from "Maintainer Review" back to "In Progress". If an issue has multiple PRs, the issue can stay "In Progress" while the PRs move through the process.

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

## Metrics Representative

- Metrics Representative ensures any analytics related changes work well with downstream data services
- This role is currently filled by @tianrunhe

## Author

- Answer or resolve each comment
    - resolve if you followed the suggestion
    - reply if you didn't
- If you need to clarify parts of the code, check if it can be done by adding comments or improve naming of variables/functions/classes
- When you replied or resolved all comments, move the PR back to reviewer- or maintainer-review
