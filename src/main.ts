import * as core from '@actions/core'
import * as _ from 'lodash'
import * as github from '@actions/github'
import context from './config'
import {Git} from './github'
import {dedent} from './utils'
import {ReposGetBranchParameters} from './types'

async function run() {
  core.info(`Now it's running ~ 😊`)

  const regExp = /([^\/)]*)\/([^@]*)@(.*)/

  const sourceList = regExp.exec(context.SOURCE)
  const destList = regExp.exec(context.DEST)

  if (!destList || !sourceList) {
    core.warning(`input is missing correct`)
    process.exit(1)
  }

  const source = {
    owner: sourceList && (sourceList[1] as string),
    repo: sourceList && (sourceList[2] as string),
    branch: sourceList && (sourceList[3] as string)
  } as ReposGetBranchParameters

  const dest = {
    owner: destList && destList[1],
    repo: destList && destList[2],
    branch: destList && destList[3]
  } as ReposGetBranchParameters

  const filePath = context.FILE_PATH
  const commitMessage = `${context.COMMIT_PREFIX} Synced local '${filePath}'`
  const GITHUB_REPOSITORY = `${source.owner}/${source.repo}`
  const branchName = `${context.BRANCH_PREFIX}/${dest.owner}/${dest.repo}/${dest.branch}`
  const pullRequestTitle = `${context.COMMIT_PREFIX} Sync from ${source.branch} branch`
  const pullRequestBody =
    dedent(`This pr synced the latest changes of ${filePath} from ${
      source.branch
    } branch

                                ---

                                This PR was created automatically and this workflow run [#${
                                  process.env.GITHUB_RUN_ID || 0
                                }](https://github.com/${GITHUB_REPOSITORY}/actions/runs/${
      process.env.GITHUB_RUN_ID || 0
    })

                                `)
  core.info(
    `will create pull request by ${branchName} in ${dest.owner}/${dest.repo} from ${GITHUB_REPOSITORY}`
  )

  const GITHUB_TOKEN = context.GITHUB_TOKEN as string
  const git = new Git(GITHUB_TOKEN)

  const changeFileContent = await git.getChangeFileContent(source, filePath)

  const treeList = await git.getTreeListWithOutPath(dest, filePath)

  const newTree = [...changeFileContent, ...treeList]

  const createTree = await git.createTreeAll(
    dest,
    newTree,
    context.CREATE_TREE_LIMIT
  )

  const createCommit = await git.addCommit(dest, createTree, commitMessage)

  await git.createOrUpdateBranch(dest, createCommit, branchName)

  const isExistingPR = await git.findExistingPr(dest, branchName)

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
