import * as core from '@actions/core'
import * as github from '@actions/github'
import {Endpoints, OctokitResponse} from '@octokit/types'
import * as _ from 'lodash'
import {
  GitCreateRefRequest,
  GitCreateRefResponseData,
  GitCreateTreeParameters,
  GitCreateTreeParamsTree,
  GitCreateTreeResponseData,
  GitGetTreeParameters,
  GitTree,
  ReposGetBranchParameters
} from './types'
import {base64ToString} from '@azure/openapi-markdown'

export class Git {
  private github
  constructor(GITHUB_TOKEN: string) {
    const octokit = github.getOctokit(GITHUB_TOKEN)
    this.github = octokit.rest
  }

  public async getBranch(getBranchRequest: ReposGetBranchParameters) {
    return await this.github.repos.getBranch(getBranchRequest)
  }

  public async getTree(getTreeRequest: GitGetTreeParameters) {
    return await this.github.git.getTree(getTreeRequest)
  }

  public async getTreeRecursive(
    getTreeRequest: Omit<GitGetTreeParameters, 'recursive'>
  ) {
    const defaultTree = await this.github.git.getTree({
      ...getTreeRequest
    })

    const level1Data: GitTree[] = defaultTree.data.tree.filter(
      n => n.type !== 'tree'
    )
    const level1Tree = defaultTree.data.tree.filter(n => n.type === 'tree')

    let level2Data: GitTree[] = []
    let level3Data: GitTree[] = []

    let n: number = 0
    let runTimes: number = 0

    console.time('GetTreeRecursive cost time')
    for (const e1 of level1Tree) {
      const level2 = await this.github.git.getTree({
        ..._.pick(getTreeRequest, ['owner', 'repo']),
        tree_sha: e1.sha!
      })
      level2.data.tree.forEach(n => (n.path = `${e1.path}/${n.path}`))
      level2Data = [
        ...level2Data,
        ...level2.data.tree.filter(n => n.type !== 'tree')
      ]
      const level2Tree = level2.data.tree.filter(n => n.type === 'tree')
      for (const e2 of level2Tree) {
        runTimes++
        const level3 = await this.github.git.getTree({
          ..._.pick(getTreeRequest, ['owner', 'repo']),
          tree_sha: e2.sha!,
          recursive: '1'
        })
        level3.data.tree.forEach(n => (n.path = `${e2.path}/${n.path}`))
        level3Data = [
          ...level3Data,
          ...level3.data.tree.filter(n => n.type !== 'tree')
        ]
        if (level3.data.truncated) {
          // If `truncated` is `true` in the response then the number of items in the `tree` array exceeded our maximum limit. If you need to fetch more items, use the non-recursive method of fetching trees, and fetch one sub-tree at a time.
          // so that need more times to get tree
          n++
          console.log('truncated is true')
        }
      }
    }

    console.timeEnd('GetTreeRecursive cost time')
    console.log(`n is ${n}`)
    console.log(`runTimes is ${runTimes}`)

    return [...level1Data, ...level2Data, ...level3Data]
  }

  public async getTreeByPath(
    filePath: string,
    getTreeRequest: Pick<GitGetTreeParameters, 'owner' | 'repo'>,
    getDefaultTree: Endpoints['GET /repos/{owner}/{repo}/git/trees/{tree_sha}']['response']
  ) {
    const tmpLoopFiles = JSON.parse(JSON.stringify(filePath.split('/')))
    let tmpDefaultTree = getDefaultTree
    let tmpTree
    let tmpTreeSha

    while (tmpLoopFiles.length > 0) {
      tmpTree = tmpDefaultTree.data.tree.find(n => n.path === tmpLoopFiles[0])
      tmpTreeSha = tmpTree!.sha!
      tmpDefaultTree = await this.github.git.getTree({
        ...getTreeRequest,
        tree_sha: tmpTreeSha!
      })

      tmpLoopFiles.shift()
    }

    const res = await this.github.git.getTree({
      ...getTreeRequest,
      tree_sha: tmpDefaultTree.data.sha,
      recursive: '1'
    })

    res.data.tree.forEach(n => {
      n.path = `${filePath}/${n.path}`
    })

    return res.data.tree.filter(n => n.type !== 'tree')
  }

  public async createTree(createTreeRequest: GitCreateTreeParameters) {
    return await this.github.git.createTree(createTreeRequest)
  }

  public async createTreeAll(
    branchRequest: ReposGetBranchParameters,
    totalTree: GitCreateTreeParamsTree[],
    ChunkLimit = 500
  ) {
    console.time('createTreeAll cost time')
    // https://docs.github.com/rest/reference/git#create-a-tree
    // Sorry, your request timed out. It's likely that your input was too large to process. Consider building the tree incrementally, or building the commits you need in a local clone of the repository and then pushing them to GitHub.
    const groupTrees = _.chunk(totalTree, ChunkLimit)
    let tmpTree
    let tmpTreeSha

    for (const tree of groupTrees) {
      tmpTree = await this.createTree({
        ..._.pick(branchRequest, ['owner', 'repo']),
        tree,
        base_tree: tmpTreeSha
      })

      tmpTreeSha = tmpTree.data.sha
    }

    console.timeEnd('createTreeAll cost time')
    return tmpTree as OctokitResponse<GitCreateTreeResponseData>
  }

  public async getContent(
    getContentRequest: Endpoints['GET /repos/{owner}/{repo}/contents/{path}']['parameters']
  ) {
    return await this.github.repos.getContent(getContentRequest)
  }

  public async createCommit(
    createCommitRequest: Endpoints['POST /repos/{owner}/{repo}/git/commits']['parameters']
  ) {
    return await this.github.git.createCommit(createCommitRequest)
  }

  public async addCommit(
    branchRequest: ReposGetBranchParameters,
    newTree: OctokitResponse<GitCreateTreeResponseData>,
    message: string
  ): Promise<Endpoints['POST /repos/{owner}/{repo}/git/commits']['response']> {
    const branchInfo = await this.getBranch(branchRequest)

    return await this.github.git.createCommit({
      ..._.pick(branchRequest, ['owner', 'repo']),
      tree: newTree.data.sha,
      message,
      parents: [branchInfo.data.commit.sha]
    })
  }

  public async createRef(
    createRefRequest: GitCreateRefRequest
  ): Promise<OctokitResponse<GitCreateRefResponseData>> {
    return await this.github.git.createRef(createRefRequest)
  }

  public async createBranch(
    branchRequest: ReposGetBranchParameters,
    commitResult: Endpoints['POST /repos/{owner}/{repo}/git/commits']['response'],
    newBranch: string
  ): Promise<OctokitResponse<GitCreateRefResponseData>> {
    return await this.github.git.createRef({
      ..._.pick(branchRequest, ['owner', 'repo']),
      ref: `refs/heads/${newBranch}`,
      sha: commitResult.data.sha
    })
  }

  public async pullRequestAdd(
    branchRequest: ReposGetBranchParameters,
    pullRequest: Endpoints['POST /repos/{owner}/{repo}/pulls']['response'],
    labels?: string[],
    assignees?: string[],
    reviewers?: string[],
    teamReviewers?: string[]
  ) {
    if (labels !== undefined && labels.length > 0) {
      core.info(`Adding label(s) "${labels.join(', ')}" to PR`)
      await this.github.issues.addLabels({
        ..._.pick(branchRequest, ['owner', 'repo']),
        issue_number: pullRequest.data.number,
        labels
      })
    }

    if (assignees !== undefined && assignees.length > 0) {
      core.info(`Adding assignee(s) "${assignees.join(', ')}" to PR`)
      await this.github.issues.addAssignees({
        ..._.pick(branchRequest, ['owner', 'repo']),
        issue_number: pullRequest.data.number,
        assignees
      })
    }

    if (reviewers !== undefined && reviewers.length > 0) {
      core.info(`Adding reviewer(s) "${reviewers.join(', ')}" to PR`)
      await this.github.pulls.requestReviewers({
        ..._.pick(branchRequest, ['owner', 'repo']),
        pull_number: pullRequest.data.number,
        reviewers
      })
    }

    if (teamReviewers !== undefined && teamReviewers.length > 0) {
      core.info(`Adding team reviewer(s) "${teamReviewers.join(', ')}" to PR`)
      await this.github.pulls.requestReviewers({
        ..._.pick(branchRequest, ['owner', 'repo']),
        pull_number: pullRequest.data.number,
        team_reviewers: teamReviewers
      })
    }
  }

  public async createPullRequest(
    branchRequest: ReposGetBranchParameters,
    newBranch: string,
    title: string,
    body: string,
    labels?: string[],
    assignees?: string[],
    reviewers?: string[],
    teamReviewers?: string[]
  ) {
    const pullRequest = await this.github.pulls.create({
      ..._.pick(branchRequest, ['owner', 'repo']),
      head: `${branchRequest.owner}:${newBranch}`,
      base: branchRequest.branch,
      title,
      body
    })

    await this.pullRequestAdd(
      branchRequest,
      pullRequest,
      labels,
      assignees,
      reviewers,
      teamReviewers
    )

    return pullRequest
  }

  public async updatePullRequest(
    branchRequest: ReposGetBranchParameters,
    prNumber: number,
    title: string,
    body: string,
    labels?: string[],
    assignees?: string[],
    reviewers?: string[],
    teamReviewers?: string[]
  ) {
    const pullRequest = await this.github.pulls.update({
      ..._.pick(branchRequest, ['owner', 'repo']),
      pull_number: prNumber,
      title,
      body
    })

    await this.pullRequestAdd(
      branchRequest,
      pullRequest as any,
      labels,
      assignees,
      reviewers,
      teamReviewers
    )

    return pullRequest
  }

  public async findExistingPr(
    branchRequest: ReposGetBranchParameters,
    newBranch: string
  ) {
    const pullRequestList = await this.github.pulls.list({
      ..._.pick(branchRequest, ['owner', 'repo']),
      state: 'open',
      head: `${_.pick(branchRequest, ['owner']).owner}:${newBranch}`
    })

    return pullRequestList.data[0]
  }

  public async getChangeFileContent(
    branchRequest: ReposGetBranchParameters,
    filePath: string
  ): Promise<GitCreateTreeParamsTree[]> {
    core.info(`1/2 Start get change files tree`)
    console.time('Get change files tree cost time')

    const branchInfo = await this.getBranch(branchRequest)
    const treeLists = await this.getTree({
      ..._.pick(branchRequest, ['owner', 'repo']),
      tree_sha: branchInfo.data.commit.sha
    })
    const diffTrees = await this.getTreeByPath(
      filePath,
      _.pick(branchRequest, ['owner', 'repo']),
      treeLists
    )
    core.info(
      `There are ${treeLists.data.tree.length} change files in ${branchRequest.owner}/${branchRequest.repo}`
    )
    console.timeEnd('Get change files tree cost time')

    core.info(`2/2 Start get change files content`)
    console.time(`Get change files content cost time`)
    const jsonFilesWithBase64Content: any[] = await Promise.all(
      diffTrees.map(async file => {
        const content: any = await this.getContent({
          ..._.pick(branchRequest, ['owner', 'repo']),
          path: file.path!,
          ref: `refs/heads/${branchRequest.branch}`
        })

        return {...file, content: content.data.content}
      })
    )

    const changeFileContent =
      jsonFilesWithBase64Content.map<GitCreateTreeParamsTree>(file => ({
        path: file.path,
        mode: '100644', // git mode for file (blob)
        type: 'blob',
        content: base64ToString(file.content)
      }))
    console.timeEnd(`Get change files content cost time`)

    return changeFileContent
  }

  public async getTreeListWithOutPath(
    branchRequest: ReposGetBranchParameters,
    filePath: string
  ): Promise<Partial<GitCreateTreeParamsTree>[]> {
    core.info(`1/1 Start get tree`)
    console.time('Get tree cost time')

    const branchInfo = await this.getBranch(branchRequest)

    // If `truncated` is `true` in the response then the number of items in the `tree` array exceeded our maximum limit. If you need to fetch more items, use the non-recursive method of fetching trees, and fetch one sub-tree at a time.
    // so that need more times to get tree
    const treeLists = await this.getTreeRecursive({
      ..._.pick(branchRequest, ['owner', 'repo']),
      tree_sha: branchInfo.data.commit.sha
    })

    console.timeEnd('Get tree cost time')
    core.info(
      `There are ${treeLists.length} tree list in ${branchRequest.owner}/${branchRequest.repo}`
    )

    const res = treeLists
      .filter(n => !n.path!.startsWith(filePath))
      .filter(n => n.type !== 'tree')
      .map(n => ({
        mode: n.mode,
        path: n.path,
        type: n.type,
        sha: n.sha
      }))

    return res as Partial<GitCreateTreeParamsTree>[]
  }
}
