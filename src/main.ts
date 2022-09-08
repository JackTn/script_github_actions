import * as core from '@actions/core'
import {base64ToString, stringToBase64} from '@azure/openapi-markdown'
import {run} from './handle'
import * as github from '@actions/github'
import {OctokitResponse} from '@octokit/types'
import {GitCreateTreeParamsTree, GitGetTreeResponseData} from './types'
import * as dotenv from 'dotenv'
dotenv.config()

import {Git} from './github'
import {pick} from './utils'

async function exec() {
  const GITHUB_TOKEN = process.env.SECRET_TOKEN as string
  const octokit = github.getOctokit(GITHUB_TOKEN)

  // You can also pass in additional options as a second parameter to getOctokit
  // const octokit = github.getOctokit(myToken, {userAgent: "MyActionVersion1"});

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
    const tmpLoopFiles = JSON.parse(JSON.stringify(loopFiles))
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
  core.info(`copyTree ${copyTree}`)

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
  const content = await octokit.repos.getContent({
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
  const c = base64ToString(content.data.content)
  core.info(`~~~~~`)
  core.info(`content ${c}`)

  const jsonFilesWithBase64Content: any[] = await Promise.all(
    copyTree.map(async file => {
      const content = await octokit.repos.getContent({
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
    ref: `refs/heads/zzzzzzz`,
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

async function deleteFile() {
  const octokit = github.getOctokit('GITHUB_TOKEN')

  const sourceBranch = 'main'
  const sourceOwner = 'JackTn'
  const sourceRepo = 'azure-rest-api-specs-pr'

  const getBranch = await octokit.repos.getBranch({
    owner: sourceOwner,
    repo: sourceRepo,
    branch: sourceBranch
  })
  const sourceTreeSha = getBranch.data.commit.sha

  const getDefaultTree = await octokit.git.getTree({
    owner: sourceOwner,
    repo: sourceRepo,
    tree_sha: sourceTreeSha
  })

  const allTree = await octokit.git.getTree({
    owner: sourceOwner,
    repo: sourceRepo,
    tree_sha: getDefaultTree.data.sha,
    recursive: '1'
  })

  core.info(`allTree ${allTree}`)

  // join this
  const filePath2 = 'specification'
  const res123 = allTree.data.tree
    .filter(n => !n.path.startsWith(`${filePath2}`))
    .filter(n => n.type !== 'tree')
    .map(n => ({
      mode: n.mode,
      path: n.path,
      type: n.type,
      sha: n.sha
    }))

  core.info(`~~~~~`)
  core.info(`res123 ${res123}`)

  //   const jsonFilesWithBase64Content: any[] = await Promise.all(
  //     allTree.data.tree.map(async file => {
  //       let content = await octokit.repos.getContent({
  //         owner: sourceOwner,
  //         repo: sourceRepo,
  //         path: file.path,
  //         ref: `refs/heads/${sourceBranch}`
  //       })

  //       return {...file, content: content.data.content}
  //     })
  //   )
  //   core.info(`~~~~~`)
  //   core.info(`jsonFilesWithBase64Content ${jsonFilesWithBase64Content}`)

  //   const newNewTree = jsonFilesWithBase64Content.map<GitCreateTreeParamsTree>(
  //     file => ({
  //       path: file.path,
  //       mode: '100644', // git mode for file (blob)
  //       type: 'blob',
  //       content: base64ToString(file.content)
  //     })
  //   )
  //---

  function group(array: any[], subGroupLength: number) {
    let index = 0
    const newArray = []

    while (index < array.length) {
      newArray.push(array.slice(index, (index += subGroupLength)))
    }

    return newArray
  }

  async function createTreeAll(
    totalTree: GitCreateTreeParamsTree[],
    baseTreeSha: string,
    ChunkLimit = 500
  ) {
    const groupTrees = group(totalTree, ChunkLimit)
    // let groupTrees = totalTree.slice(0, 100)
    let tmpTree
    let tmpTreeSha
    // https://docs.github.com/rest/reference/git#create-a-tree
    // Sorry, your request timed out. It's likely that your input was too large to process. Consider building the tree incrementally, or building the commits you need in a local clone of the repository and then pushing them to GitHub.
    // https://www.atlassian.com/git/tutorials/big-repositories
    // https://github.com/processing/processing/issues/1898.html

    for (const tree of groupTrees) {
      tmpTree = await octokit.git.createTree({
        owner: sourceOwner,
        repo: sourceRepo,
        tree,
        base_tree: tmpTreeSha
      })

      tmpTreeSha = tmpTree.data.sha
    }

    return tmpTree
  }

  const newTree = await createTreeAll(
    res123 as GitCreateTreeParamsTree[],
    sourceTreeSha
  )
  core.info(`~~~~~`)
  core.info(`newTree ${newTree}`)

  // https://docs.github.com/en/rest/reactions#about-the-reactions-api
  const commitResult = await octokit.git.createCommit({
    owner: sourceOwner,
    repo: sourceRepo,
    tree: newTree!.data.sha,
    message: 'test delete files',
    parents: [sourceTreeSha]
  })

  core.info(`~~~~~`)
  core.info(`commitResult ${commitResult}`)

  const createRef = await octokit.git.createRef({
    owner: sourceOwner,
    repo: sourceRepo,
    ref: `refs/heads/testdelete2022090711`,
    sha: commitResult.data.sha
  })
  core.info(`~~~~~`)
  core.info(`createRef ${createRef}`)
}

// deleteFile()

async function testClone() {
  const octokit = github.getOctokit('GITHUB_TOKEN')

  const sourceBranch = 'main'
  const sourceOwner = 'JackTn'
  const sourceRepo = 'azure-rest-api-specs-pr'

  const getBranch = await octokit.repos.getBranch({
    owner: sourceOwner,
    repo: sourceRepo,
    branch: sourceBranch
  })
  const sourceTreeSha = getBranch.data.commit.sha

  core.info(`~~~~~`)
  core.info(`sourceTreeSha ${sourceTreeSha}`)

  const newTree123 = await octokit.git.createTree({
    owner: sourceOwner,
    repo: sourceRepo,
    tree: [
      {
        mode: '100644',
        path: 'specification/GetBlob.json',
        type: 'blob',
        content: 'HELLO WORD'
      }
    ],
    base_tree: undefined
  })
  core.info(`~~~~~`)
  core.info(`newTree123 ${newTree123}`)

  const commitResult = await octokit.git.createCommit({
    owner: sourceOwner,
    repo: sourceRepo,
    tree: newTree123.data.sha,
    message: 'test delete files',
    parents: [sourceTreeSha]
  })
  core.info(`~~~~~`)
  core.info(`commitResult ${commitResult}`)

  const createRef = await octokit.git.createRef({
    owner: sourceOwner,
    repo: sourceRepo,
    ref: `refs/heads/testDelete2022090706`,
    sha: commitResult.data.sha
  })
  core.info(`~~~~~`)
  core.info(`createRef ${createRef}`)
}

// testClone()

async function testCreatePR() {
  const owner = 'JackTn'
  const repo = 'azure-rest-api-specs-pr'
  const base = 'main'
  const head = 'JackTn:testdelete2022090711'
  const octokit = github.getOctokit('GITHUB_TOKEN')
  const pr = await octokit.pulls.create({
    owner,
    repo,
    head,
    base,
    title: '测试机333 title',
    body: '测试222 body'
  })

  core.info(`~~~~~`)
  core.info(`pr ${pr}`)
  const labels = ['bug', 'documentation']
  await octokit.issues.addLabels({
    owner,
    repo,
    issue_number: pr.data.number,
    labels
  })
  const assignees = ['JackTn', 'Keryul']
  await octokit.issues.addAssignees({
    owner,
    repo,
    issue_number: pr.data.number,
    assignees
  })

  // Review cannot be requested from pull request author.
  // Reviews may only be requested from collaborators. One or more of the users or teams you specified is not a collaborator of the JackTn/azure-rest-api-specs-pr repository
  const reviewers = ['Keryul']
  await octokit.pulls.requestReviewers({
    owner,
    repo,
    pull_number: pr.data.number,
    reviewers
  })
}
// testCreatePR()

async function test() {
  const git = new Git()
  const p = {
    owner: 'JackTn',
    repo: 'script_github_actions',
    branch: 'main'
  }
  const branchInfo = await git.getBranch(p)
  console.log(branchInfo)
}

//   test()
async function getDiffFiles() {
  const git = new Git()
  const source = {
    owner: 'JackTn',
    repo: 'test-repo-billy',
    branch: 'main'
  }
  console.log()
  const files = 'specification/common-types'
  const branchInfo = await git.getBranch(source)
  const a = pick(source, ['owner', 'repo'])
  let getDefaultTreeParam = { ...a, tree_sha: branchInfo.data.commit.sha }
  const getDefaultTree = await git.getTree(getDefaultTreeParam, tree_sha: branchInfo.data.commit.sha )
}

getDiffFiles()
