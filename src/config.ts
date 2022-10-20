import * as core from '@actions/core'
const {getInput} = require('action-input-parser')

type config = {
  SOURCE: string
  DEST: string
  FILE_PATH: string
  GITHUB_TOKEN: string
  COMMIT_BODY: string
  COMMIT_PREFIX: string
  CREATE_TREE_LIMIT: number
  COMMIT_MESSAGE: string
  PR_LABELS: string[]
  PR_BODY: string
  ASSIGNEES: string[]
  REVIEWERS: string[]
  TEAM_REVIEWERS: string[]
  BRANCH_PREFIX: string
  ENV: string
}

let context: config

try {
  context = {
    ENV: getInput({
      key: 'ENV'
    }),
    SOURCE: getInput({
      key: 'SOURCE'
    }),
    DEST: getInput({
      key: 'DEST'
    }),
    FILE_PATH: getInput({
      key: 'FILE_PATH'
    }),
    GITHUB_TOKEN: getInput({
      key: 'GITHUB_TOKEN'
    }),
    COMMIT_BODY: getInput({
      key: 'COMMIT_BODY',
      default: ''
    }),
    COMMIT_PREFIX: getInput({
      key: 'COMMIT_PREFIX',
      default: '🔄'
    }),
    CREATE_TREE_LIMIT: getInput({
      key: 'CREATE_TREE_LIMIT',
      type: 'number',
      default: 500
    }),
    COMMIT_MESSAGE: getInput({
      key: 'COMMIT_MESSAGE',
      type: 'string',
      default: ''
    }),
    PR_LABELS: getInput({
      key: 'PR_LABELS',
      type: 'array'
    }),
    PR_BODY: getInput({
      key: 'PR_BODY',
      default: ''
    }),
    ASSIGNEES: getInput({
      key: 'ASSIGNEES',
      type: 'array'
    }),
    REVIEWERS: getInput({
      key: 'REVIEWERS',
      type: 'array'
    }),
    TEAM_REVIEWERS: getInput({
      key: 'TEAM_REVIEWERS',
      type: 'array'
    }),
    BRANCH_PREFIX: getInput({
      key: 'BRANCH_PREFIX',
      default: 'repo-sync'
    })
  }

  core.setSecret(context.GITHUB_TOKEN)

  core.debug(JSON.stringify(context, null, 2))
} catch (err) {
  core.setFailed(err as string)
  process.exit(1)
}

export default context
