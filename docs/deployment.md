# Deployment

- Releases are handled by [release-please](https://github.com/googleapis/release-please).

- When a commit is pushed to a branch named `master` or `hotfix*`, our [release-please action](../.github/workflows/release-please.yml) creates a new PR that increments the version number and creates a changelog based on the commit messages.

- The app is then docerized & the image is sent to our development artifact registry

- The default commit message for that PR is `chore(release): release vX.Y.Z`

- When the release-please PR gets merged, our [Release to Staging action](../.github/workflows/release-to-staging.yml) tags the pre-built image with the version number in our production repository, deploys it to staging, and opens a PR against the `production` branch

- When that PR gets merged, our [Release to Production action](../.github/workflows/release-to-prod.yml) deploys the release to production
