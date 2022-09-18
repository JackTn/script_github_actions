import * as core from '@actions/core'
import * as _ from 'lodash'
import * as github from '@actions/github'
import context from './config'
import {Git} from './github'
import {dedent} from './utils'

async function run() {
  core.info(
    `GITHUB_TOKEN ${context.GITHUB_TOKEN} ${typeof context.GITHUB_TOKEN}`
  )
  core.info(`${JSON.stringify(github.context)}`)

  // local debug mode
  //   const source = {
  //     owner: 'local debug owner',
  //     repo: 'local debug repo',
  //     branch: 'local debug branch'
  //   }
  //   const source = {
  //     owner: 'JackTn',
  //     repo: 'script_github_actions',
  //     branch: 'main'
  //   }

  // github action mode
  const {owner, repo} = github.context.repo
  const refs = github.context.ref
  const source = {
    owner,
    repo,
    branch: refs.split('/')[2]
  }

  const dest = {
    owner: context.OWNER,
    repo: context.REPO,
    branch: context.BRANCH
  }

  const filePath = context.FILE_PATH
  const commitMessage = `${context.COMMIT_PREFIX} Synced local '${filePath}'`
  const GITHUB_REPOSITORY = `${source.owner}/${source.repo}`
  const branchName = `${context.BRANCH_PREFIX}/${GITHUB_REPOSITORY}/${source.branch}`
  const pullRequestTitle = `${context.COMMIT_PREFIX} Synced file(s) with ${GITHUB_REPOSITORY}`

  const GITHUB_TOKEN = context.GITHUB_TOKEN as string
  const git = new Git(GITHUB_TOKEN)
  const changeFileContent = await git.getChangeFileContent(source, filePath)

  const pullRequestBody =
    dedent(`Synced local file(s) with [${GITHUB_REPOSITORY}](https://github.com/${GITHUB_REPOSITORY})

                                ---

                                This PR was created automatically and this workflow run [#${
                                  process.env.GITHUB_RUN_ID || 0
                                }](https://github.com/${GITHUB_REPOSITORY}/actions/runs/${
      process.env.GITHUB_RUN_ID || 0
    })

                                `)

  const isExistingPR = await git.findExistingPr(dest, branchName)

  const treeList = await git.getTreeListWithOutPath(dest, filePath)

  const newTree = [...changeFileContent, ...treeList]

  const createTree = await git.createTreeAll(dest, newTree, 500)

  const createCommit = await git.addCommit(dest, createTree, commitMessage)

  if (isExistingPR) {
    await git.updatePullRequest(
      dest,
      isExistingPR.number,
      pullRequestTitle,
      dedent(`
        ⚠️ This PR is being automatically resync ⚠️
        ${pullRequestBody}
    `),
      context.PR_LABELS,
      context.ASSIGNEES,
      context.REVIEWERS,
      context.TEAM_REVIEWERS
    )

    core.notice(
      `Pull Request #${isExistingPR.number} updated: ${isExistingPR.html_url}`
    )
  } else {
    await git.createBranch(dest, createCommit, branchName)
    const pullRequest = await git.createPullRequest(
      dest,
      branchName,
      pullRequestTitle,
      pullRequestBody,
      context.PR_LABELS,
      context.ASSIGNEES,
      context.REVIEWERS,
      context.TEAM_REVIEWERS
    )
    core.notice(
      `Pull Request #${pullRequest.data.number} created: ${pullRequest.data.html_url}`
    )
  }

  core.info(`Finished`)
}

run()
