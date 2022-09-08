import {Endpoints} from '@octokit/types'

export interface GitCreateTreeParamsTree {
  path?: string
  mode?: '100644' | '100755' | '040000' | '160000' | '120000'
  type?: 'blob' | 'tree' | 'commit'
  sha?: string | null
  content?: string
}

export type ReposGetBranchParameters = Endpoints['GET /repos/{owner}/{repo}/branches/{branch}']['parameters']

export interface ReposGetBranchResponseData {
  name: string
  commit: {
    sha: string
    node_id: string
    commit: {
      author: {
        name: string
        date: string
        email: string
      }
      url: string
      message: string
      tree: {
        sha: string
        url: string
      }
      committer: {
        name: string
        date: string
        email: string
      }
      verification: {
        verified: boolean
        reason: string
        signature: string
        payload: string
      }
    }
    author: {
      gravatar_id: string
      avatar_url: string
      url: string
      id: number
      login: string
    }
    parents: {
      sha: string
      url: string
    }[]
    url: string
    committer: {
      gravatar_id: string
      avatar_url: string
      url: string
      id: number
      login: string
    }
  }
  _links: {
    html: string
    self: string
  }
  protected: boolean
  protection: {
    enabled: boolean
    required_status_checks: {
      enforcement_level: string
      contexts: string[]
    }
  }
  protection_url: string
}

export type GitGetTreeParameters = Endpoints['GET /repos/{owner}/{repo}/git/trees/{tree_sha}']['parameters']

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

export type GitCreateTreeParameters = Endpoints['POST /repos/{owner}/{repo}/git/trees']['parameters']

export interface GitCreateTreeResponseData {
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
}

export type ReposGetContentParameters = Endpoints['GET /repos/{owner}/{repo}/contents/{path}']['parameters']

export interface ReposGetContentResponseData {
  type: string
  encoding: string
  size: number
  name: string
  path: string
  content: string
  sha: string
  url: string
  git_url: string
  html_url: string
  download_url: string
  target: string
  submodule_git_url: string
  _links: {
    git: string
    self: string
    html: string
  }
}

type GitCreateCommitParamsAuthor = {
  name?: string
  email?: string
  date?: string
}

declare type GitCreateCommitParamsCommitter = {
  name?: string
  email?: string
  date?: string
}
// export type GitCreateCommitParameters = Endpoints["POST /repos/{owner}/{repo}/git/commits"]['parameters']
export type GitCreateCommitParameters = {
  owner: string
  repo: string
  /**
   * The commit message
   */
  message: string
  /**
   * The SHA of the tree object this commit points to
   */
  tree: string
  /**
   * The SHAs of the commits that were the parents of this commit. If omitted or empty, the commit will be written as a root commit. For a single parent, an array of one SHA should be provided; for a merge commit, an array of more than one should be provided.
   */
  parents: string[]
  /**
   * Information about the author of the commit. By default, the `author` will be the authenticated user and the current date. See the `author` and `committer` object below for details.
   */
  author?: GitCreateCommitParamsAuthor
  /**
   * Information about the person who is making the commit. By default, `committer` will use the information set in `author`. See the `author` and `committer` object below for details.
   */
  committer?: GitCreateCommitParamsCommitter
  /**
   * The [PGP signature](https://en.wikipedia.org/wiki/Pretty_Good_Privacy) of the commit. GitHub adds the signature to the `gpgsig` header of the created commit. For a commit signature to be verifiable by Git or GitHub, it must be an ASCII-armored detached PGP signature over the string commit as it would be written to the object database. To pass a `signature` parameter, you need to first manually create a valid PGP signature, which can be complicated. You may find it easier to [use the command line](https://git-scm.com/book/id/v2/Git-Tools-Signing-Your-Work) to create signed commits.
   */
  signature?: string
}

export interface GitCreateCommitResponseData {
  sha: string
  node_id: string
  url: string
  author: {
    date: string
    name: string
    email: string
  }
  committer: {
    date: string
    name: string
    email: string
  }
  message: string
  tree: {
    url: string
    sha: string
  }
  parents: {
    url: string
    sha: string
  }[]
  verification: {
    verified: boolean
    reason: string
    signature: string
    payload: string
  }
}

export type GitCreateRefRequest = Endpoints['POST /repos/{owner}/{repo}/git/refs']['parameters']
export interface GitCreateRefResponseData {
  ref: string
  node_id: string
  url: string
  object: {
    type: string
    sha: string
    url: string
  }
}
