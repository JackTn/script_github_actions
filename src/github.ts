import * as core from '@actions/core'
import * as github from '@actions/github'
import * as dotenv from 'dotenv'
import {OctokitResponse} from '@octokit/types'
import {
  GitCreateCommitParameters,
  GitCreateCommitResponseData,
  GitCreateRefRequest,
  GitCreateRefResponseData,
  GitCreateTreeParameters,
  GitCreateTreeResponseData,
  GitGetTreeParameters,
  GitGetTreeResponseData,
  ReposGetBranchParameters,
  ReposGetBranchResponseData,
  ReposGetContentParameters,
  ReposGetContentResponseData
} from './types'

dotenv.config()

export class Git {
  private github
  constructor() {
    const GITHUB_TOKEN = process.env.SECRET_TOKEN as string
    const octokit = github.getOctokit(GITHUB_TOKEN)
    this.github = octokit
  }

  public async coreInfo() {
    const {owner, repo} = this.github.context.repo
    const payload = this.github.context.payload
    const eventName = this.github.context.eventName
    const sha = this.github.context.sha
    const ref = this.github.context.ref
    const action = this.github.context.action
    const runNumber = this.github.context.runNumber
    const runId = this.github.context.runId

    core.info(`owner ${owner}`)
    core.info(`repo ${repo}`)
    core.info(`payload ${JSON.stringify(payload)}`)
    core.info(`eventName ${eventName}`)
    core.info(`sha ${sha}`)
    core.info(`ref ${ref}`)
    core.info(`action ${action}`)
    core.info(`runNumber ${runNumber}`)
    core.info(`runId ${runId}`)
  }

  public async debugInfo() {
    console.log(this.github)
  }

  public async getBranch(
    getBranchRequest: ReposGetBranchParameters
  ): Promise<OctokitResponse<ReposGetBranchResponseData>> {
    return await this.github.repos.getBranch(getBranchRequest)
  }

  public async getTree(
    getTreeRequest: GitGetTreeParameters
  ): Promise<OctokitResponse<GitGetTreeResponseData>> {
    return await this.github.git.getTree(getTreeRequest)
  }

  //public async loopGetTree(
  //  GetTreeRequest: GitGetTreeParameters
  //): Promise<OctokitResponse<GitGetTreeResponseData>> {
  //  return await this.github.git.getTree(GetTreeRequest)
  //}

  public async createTree(
    createTreeRequest: GitCreateTreeParameters
  ): Promise<OctokitResponse<GitCreateTreeResponseData>> {
    return await this.github.git.createTree(createTreeRequest)
  }

  public async createTreeAll() {
    // https://docs.github.com/rest/reference/git#create-a-tree
    // Sorry, your request timed out. It's likely that your input was too large to process. Consider building the tree incrementally, or building the commits you need in a local clone of the repository and then pushing them to GitHub.
  }

  public async getContent(
    getContentRequest: ReposGetContentParameters
  ): Promise<OctokitResponse<ReposGetContentResponseData>> {
    return await this.github.repos.getContent(getContentRequest)
  }

  public async createCommit(
    createCommitRequest: GitCreateCommitParameters
  ): Promise<OctokitResponse<GitCreateCommitResponseData>> {
    return await this.github.git.createCommit(createCommitRequest)
  }

  public async createRef(
    createRefRequest: GitCreateRefRequest
  ): Promise<OctokitResponse<GitCreateRefResponseData>> {
    return await this.github.git.createRef(createRefRequest)
  }
}
