import * as core from '@actions/core'
import {base64ToString, stringToBase64} from '@azure/openapi-markdown'
import {run} from './handle'
import * as github from '@actions/github'
import {OctokitResponse} from '@octokit/types'

export interface GitGetTreeResponseData {
  sha: string
  url: string
  tree: {
    path: string
    mode: string
    type: string
    size: number
    sha: string
    url: string
  }[]
  truncated: boolean
}

export interface GitCreateTreeParamsTree {
  path?: string
  mode?: '100644' | '100755' | '040000' | '160000' | '120000'
  type?: 'blob' | 'tree' | 'commit'
  sha?: string | null
  content?: string
}

// const item = {
//   repo: {
//     name: '',
//     user: '',
//     fullName: '',
//     branch: 'RPSaaSMaster'
//   },
//   files: ['specification/common-types']
// }

// core.info(`Repository Info`)
// core.info(`Slug		: ${item.repo.name}`)
// core.info(`Owner		: ${item.repo.user}`)
// core.info(`Https Url	: https://${item.repo.fullName}`)
// core.info(`Branch		: ${item.repo.branch}`)
// core.info('	')
async function exec() {
  const octokit = github.getOctokit('')
  // You can also pass in additional options as a second parameter to getOctokit
  // const octokit = github.getOctokit(myToken, {userAgent: "MyActionVersion1"});

  //   const {owner, repo} = github.context.repo
  //   const payload = github.context.payload
  //   const eventName = github.context.eventName
  //   const sha = github.context.sha
  //   const ref = github.context.ref
  //   const action = github.context.action
  //   const runNumber = github.context.runNumber
  //   const runId = github.context.runId

  //   core.info(`owner ${owner}`)
  //   core.info(`repo ${repo}`)
  //   core.info(`payload ${JSON.stringify(payload)}`)
  //   core.info(`eventName ${eventName}`)
  //   core.info(`sha ${sha}`)
  //   core.info(`ref ${ref}`)
  //   core.info(`action ${action}`)
  //   core.info(`runNumber ${runNumber}`)
  //   core.info(`runId ${runId}`)

  //   const allLabels = await octokit.issues.listLabelsForRepo({
  //     owner: 'test-repo-billy',
  //     repo: 'azure-rest-api-specs'
  //   })
  //   core.info(`~~~~~`)
  //   core.info(`allLabels ${allLabels}`)

  const sourceBranch = 'main'
  const sourceOwner = 'JackTn'
  const sourceRepo = 'script_github_actions'

  const getBranch = await octokit.repos.getBranch({
    owner: sourceOwner,
    repo: sourceRepo,
    branch: sourceBranch
  })

  core.info(`~~~~~`)
  core.info(`getBranch ${getBranch}`)
  const sourceTreeSha = getBranch.data.commit.sha

  const filePath = 'specification/common-types'

  const getDefaultTree = await octokit.git.getTree({
    owner: sourceOwner,
    repo: sourceRepo,
    tree_sha: sourceTreeSha
  })

  core.info(`~~~~~`)
  core.info(`getTree ${getDefaultTree}`)

  // type: blob tree
  const loopFiles = filePath.split('/')

  async function getTreeByLoop(
    loopFiles: string[],
    getDefaultTree: OctokitResponse<GitGetTreeResponseData>
  ) {
    let tmpLoopFiles = JSON.parse(JSON.stringify(loopFiles))
    let tmpDefaultTree = getDefaultTree
    let tmpTree
    let tmpTreeSha
    // let signalFile
    // let tmpTreeSignalFile = []
    while (tmpLoopFiles.length > 0) {
      tmpTree = tmpDefaultTree.data.tree.find(
        n => n.type === 'tree' && n.path === tmpLoopFiles[0]
      )

      tmpTreeSha = tmpTree!.sha
      tmpDefaultTree = await octokit.git.getTree({
        owner: sourceOwner,
        repo: sourceRepo,
        tree_sha: tmpTreeSha
      })

      // 为了避免影响单个文件
      //  if (tmpLoopFiles.length === 1) {
      //    signalFile = tmpDefaultTree.data.tree.find(
      //      n => n.type === 'blob' && n.path === tmpLoopFiles[0]
      //    )
      //    if (signalFile) {
      //      tmpTreeSignalFile.push(signalFile)
      //    }
      //  }

      tmpLoopFiles.shift()
    }

    tmpDefaultTree.data.tree.forEach(n => {
      n.path = `${loopFiles.join('/')}/${n.path}`
    })

    const res = await octokit.git.getTree({
      owner: sourceOwner,
      repo: sourceRepo,
      tree_sha: tmpDefaultTree.data.sha,
      recursive: '1'
    })

    res.data.tree.forEach(n => {
      n.path = `${loopFiles.join('/')}/${n.path}`
    })

    return res.data.tree.filter(n => n.type === 'blob')
  }

  const copyTree = await getTreeByLoop(loopFiles, getDefaultTree)
  core.info(`~~~~~`)
  core.info(`getTree ${copyTree}`)

  //   const getAllTree = await octokit.git.getTree({
  //     owner: sourceOwner,
  //     repo: sourceRepo,
  //     tree_sha: copyTree.data.sha,
  //     recursive: '1'
  //   })

  //   core.info(`~~~~~`)
  //   core.info(`getAllTree ${getAllTree}`)

  //   const OutTreeSha = getDefaultTree.data.tree.find(
  //     n => n.type === 'tree' && n.path.startsWith(filePath.split('/')[0])
  //   )

  // 加个正则判断 **/**/**/**
  //   const sourceOutTreeSha = OutTreeSha!.sha
  //   const getTree = await octokit.git.getTree({
  //     owner: sourceOwner,
  //     repo: sourceRepo,
  //     tree_sha: sourceOutTreeSha
  //   })

  // getFile ********************************
  let content = await octokit.repos.getContent({
    owner: sourceOwner,
    repo: sourceRepo,
    path: `specification/common-types/resource-management/v2/privatelinks.json`,
    ref: `refs/heads/${sourceBranch}`
  })
  //   copyTree.forEach(async t => {
  //     content.push(
  //       await octokit.repos.getContent({
  //         owner: sourceOwner,
  //         repo: sourceRepo,
  //         path: t.path,
  //         ref: `refs/heads/${sourceBranch}`
  //       })
  //     )
  //   })
  let c = base64ToString(content.data.content)
  core.info(`~~~~~`)
  core.info(`content ${c}`)

  const jsonFilesWithBase64Content: any[] = await Promise.all(
    copyTree.map(async file => {
      let content = await octokit.repos.getContent({
        owner: sourceOwner,
        repo: sourceRepo,
        path: file.path,
        ref: `refs/heads/${sourceBranch}`
      })

      return {...file, content: content.data.content}
    })
  )
  core.info(`~~~~~`)
  core.info(`jsonFilesWithBase64Content ${jsonFilesWithBase64Content}`)

  const newNewTree = jsonFilesWithBase64Content.map<GitCreateTreeParamsTree>(
    file => ({
      path: file.path,
      mode: '100644', // git mode for file (blob)
      type: 'blob',
      content: base64ToString(file.content)
    })
  )

  // create tree
  //   const treeF: GitCreateTreeParamsTree[] = [
  //     {
  //       path: `specification/common-types/resource-management/v2/privatelinks.json`,
  //       mode: '100644', // git mode for file (blob)
  //       type: 'blob',
  //       content: c
  //     }
  //   ]

  const newTree = await octokit.git.createTree({
    owner: sourceOwner,
    repo: sourceRepo,
    tree: newNewTree
  })
  core.info(`~~~~~`)
  core.info(`newTree ${newTree}`)

  const commitResult = await octokit.git.createCommit({
    owner: sourceOwner,
    repo: sourceRepo,
    tree: newTree.data.sha,
    message: 'fffffffff',
    parents: [sourceTreeSha]
  })

  core.info(`~~~~~`)
  core.info(`commitResult ${commitResult}`)

  await octokit.git.createRef({
    owner: sourceOwner,
    repo: sourceRepo,
    ref: `refs/heads/dfgvvvv`,
    sha: commitResult.data.sha
  })

  //   octokit.pulls.create({
  //     owner,
  //     repo,
  //     head,
  //     base,
  //   });
  //   core.info(`~~~~~`)
  //   core.info(`getTree ${getTree}`)

  //   const destBranch = "testBranch123"
  //   const destOwner = "test-repo-billy"
  //   const destRepo = "azure-rest-api-specs-pr"
  //   const destSha = " "
  //   octokit.rest.git.createRef({
  //     owner:destOwner,
  //     repo:destRepo,
  //     ref: `refs/heads/${destBranch}`,
  //     sha: destSha,
  //   });

  // get app installation_id
  //await octokit.request('GET /installation/repositories', {})

  //   const token = core.getInput('github-token')
  //   // const token = process.env['INPUT_GITHUB_TOKEN'] as string
  //   run(token)
}

exec()
