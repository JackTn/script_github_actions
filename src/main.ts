import {OctokitResponse} from '@octokit/types'
import {GitCreateTreeParamsTree, GitGetTreeResponseData} from './types'
import {base64ToString} from '@azure/openapi-markdown'
import * as core from '@actions/core'
import * as github from '@actions/github'
import * as _ from 'lodash'
import * as dotenv from 'dotenv'
dotenv.config()

import {Git} from './github'

// getChangeFileContent()

// get change files from source reop
// get Tree from dest repo
// filter path from dest repo
// merge changes files and dest repo files
// create all tree
// push then create pr

async function run() {
  const source = {
    owner: 'JackTn',
    repo: 'azure-rest-api-specs-pr',
    branch: 'main'
  }
  const dest = {
    owner: 'JackTn',
    repo: 'azure-rest-api-specs',
    branch: 'main'
  }

  const filePath = 'specification/common-types'

  const GITHUB_TOKEN = process.env.SECRET_TOKEN as string
  const git = new Git(GITHUB_TOKEN)
  const changeFileContent = await git.getChangeFileContent(source, filePath)
  const treeList = await git.getTreeListWithOutPath(dest, filePath)

  const newTree = [...changeFileContent, ...treeList]

  const createTree = await git.createTreeAll(dest, newTree, 500)

  const createCommit = await git.addCommit(dest, createTree, '测试')

  const branchName = 'testBranch20220913003'

  const newBranch = await git.createBranch(dest, createCommit, branchName)

  if (newBranch.data.url) {
    console.log('branch has been created')
  }

  const title = 'test title55'
  const body = 'test body55'

  const pullRequest = await git.createPullRequest(dest, branchName, title, body)

  // add update pr

  if (pullRequest.data.url) {
    console.log(`pullRequest has been created ${pullRequest.data.url}`)
  }

  core.info(`Finished`)
}

// run()

async function testGetInput() {
  const GIT_EMAIL = core.getInput('GIT_EMAIL')
  core.info(`GIT_EMAIL ${GIT_EMAIL} ${typeof GIT_EMAIL}`)
  const ASSIGNEES = core.getInput('ASSIGNEES')
  core.info(`ASSIGNEES ${ASSIGNEES} ${typeof ASSIGNEES}`)
  const PR_LABELS = core.getInput('PR_LABELS')
  core.info(`PR_LABELS ${PR_LABELS} ${typeof PR_LABELS}`)

  const GIT_EMAIL1 = core.getInput('GIT_EMAIL')
  core.info(`GIT_EMAIL ${GIT_EMAIL} ${typeof GIT_EMAIL1}`)
  const ASSIGNEES1 = core.getMultilineInput('ASSIGNEES')
  core.info(`ASSIGNEES1 ${ASSIGNEES[0]} ${typeof ASSIGNEES1}`)
  core.info(`ASSIGNEES2 ${ASSIGNEES[1]} ${typeof ASSIGNEES1}`)
  const PR_LABELS1 = core.getBooleanInput('PR_LABELS')
  core.info(`PR_LABELS ${PR_LABELS1} ${typeof PR_LABELS1}`)
  //   core.info('\u001b[43mThis background will be yellow')
  //   core.info('\u001b[1mBold text')
  //   core.info('\u001b[3mItalic text')
  //   core.info('\u001b[4mUnderlined text')
  //   core.error('This is a bad error. This will also fail the build.')
  //   core.warning(
  //     "Something went wrong, but it's not bad enough to fail the build."
  //   )
  //   core.setFailed('You must provide either GH_PAT or GH_INSTALLATION_TOKEN')
}

testGetInput()
