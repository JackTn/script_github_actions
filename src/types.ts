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

export interface GitTree {
  path?: string
  mode?: string
  type?: string
  size?: number
  sha?: string
  url?: string
}

export interface GitCreateTreeResponseData {
  sha: string
  url: string
  truncated: boolean
  tree: {
    path?: string | undefined
    mode?: string | undefined
    type?: string | undefined
    sha?: string | undefined
    size?: number | undefined
    url?: string | undefined
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

export type PullsCreateRequest = Endpoints['POST /repos/{owner}/{repo}/pulls']['parameters']

export interface PullsCreateResponseData {
  url: string
  id: number
  node_id: string
  html_url: string
  diff_url: string
  patch_url: string
  issue_url: string
  commits_url: string
  review_comments_url: string
  review_comment_url: string
  comments_url: string
  statuses_url: string
  number: number
  state: string
  locked: boolean
  title: string
  user: {
    login: string
    id: number
    node_id: string
    avatar_url: string
    gravatar_id: string
    url: string
    html_url: string
    followers_url: string
    following_url: string
    gists_url: string
    starred_url: string
    subscriptions_url: string
    organizations_url: string
    repos_url: string
    events_url: string
    received_events_url: string
    type: string
    site_admin: boolean
  }
  body: string
  labels: {
    id: number
    node_id: string
    url: string
    name: string
    description: string
    color: string
    default: boolean
  }[]
  milestone: {
    url: string
    html_url: string
    labels_url: string
    id: number
    node_id: string
    number: number
    state: string
    title: string
    description: string
    creator: {
      login: string
      id: number
      node_id: string
      avatar_url: string
      gravatar_id: string
      url: string
      html_url: string
      followers_url: string
      following_url: string
      gists_url: string
      starred_url: string
      subscriptions_url: string
      organizations_url: string
      repos_url: string
      events_url: string
      received_events_url: string
      type: string
      site_admin: boolean
    }
    open_issues: number
    closed_issues: number
    created_at: string
    updated_at: string
    closed_at: string
    due_on: string
  }
  active_lock_reason: string
  created_at: string
  updated_at: string
  closed_at: string
  merged_at: string
  merge_commit_sha: string
  assignee: {
    login: string
    id: number
    node_id: string
    avatar_url: string
    gravatar_id: string
    url: string
    html_url: string
    followers_url: string
    following_url: string
    gists_url: string
    starred_url: string
    subscriptions_url: string
    organizations_url: string
    repos_url: string
    events_url: string
    received_events_url: string
    type: string
    site_admin: boolean
  }
  assignees: {
    login: string
    id: number
    node_id: string
    avatar_url: string
    gravatar_id: string
    url: string
    html_url: string
    followers_url: string
    following_url: string
    gists_url: string
    starred_url: string
    subscriptions_url: string
    organizations_url: string
    repos_url: string
    events_url: string
    received_events_url: string
    type: string
    site_admin: boolean
  }[]
  requested_reviewers: {
    login: string
    id: number
    node_id: string
    avatar_url: string
    gravatar_id: string
    url: string
    html_url: string
    followers_url: string
    following_url: string
    gists_url: string
    starred_url: string
    subscriptions_url: string
    organizations_url: string
    repos_url: string
    events_url: string
    received_events_url: string
    type: string
    site_admin: boolean
  }[]
  requested_teams: {
    id: number
    node_id: string
    url: string
    html_url: string
    name: string
    slug: string
    description: string
    privacy: string
    permission: string
    members_url: string
    repositories_url: string
    parent: {
      [k: string]: unknown
    }
  }[]
  head: {
    label: string
    ref: string
    sha: string
    user: {
      login: string
      id: number
      node_id: string
      avatar_url: string
      gravatar_id: string
      url: string
      html_url: string
      followers_url: string
      following_url: string
      gists_url: string
      starred_url: string
      subscriptions_url: string
      organizations_url: string
      repos_url: string
      events_url: string
      received_events_url: string
      type: string
      site_admin: boolean
    }
    repo: {
      id: number
      node_id: string
      name: string
      full_name: string
      owner: {
        login: string
        id: number
        node_id: string
        avatar_url: string
        gravatar_id: string
        url: string
        html_url: string
        followers_url: string
        following_url: string
        gists_url: string
        starred_url: string
        subscriptions_url: string
        organizations_url: string
        repos_url: string
        events_url: string
        received_events_url: string
        type: string
        site_admin: boolean
      }
      private: boolean
      html_url: string
      description: string
      fork: boolean
      url: string
      archive_url: string
      assignees_url: string
      blobs_url: string
      branches_url: string
      collaborators_url: string
      comments_url: string
      commits_url: string
      compare_url: string
      contents_url: string
      contributors_url: string
      deployments_url: string
      downloads_url: string
      events_url: string
      forks_url: string
      git_commits_url: string
      git_refs_url: string
      git_tags_url: string
      git_url: string
      issue_comment_url: string
      issue_events_url: string
      issues_url: string
      keys_url: string
      labels_url: string
      languages_url: string
      merges_url: string
      milestones_url: string
      notifications_url: string
      pulls_url: string
      releases_url: string
      ssh_url: string
      stargazers_url: string
      statuses_url: string
      subscribers_url: string
      subscription_url: string
      tags_url: string
      teams_url: string
      trees_url: string
      clone_url: string
      mirror_url: string
      hooks_url: string
      svn_url: string
      homepage: string
      language: string
      forks_count: number
      stargazers_count: number
      watchers_count: number
      size: number
      default_branch: string
      open_issues_count: number
      is_template: boolean
      topics: string[]
      has_issues: boolean
      has_projects: boolean
      has_wiki: boolean
      has_pages: boolean
      has_downloads: boolean
      archived: boolean
      disabled: boolean
      visibility: string
      pushed_at: string
      created_at: string
      updated_at: string
      permissions: {
        admin: boolean
        push: boolean
        pull: boolean
      }
      allow_rebase_merge: boolean
      template_repository: {
        [k: string]: unknown
      }
      temp_clone_token: string
      allow_squash_merge: boolean
      delete_branch_on_merge: boolean
      allow_merge_commit: boolean
      subscribers_count: number
      network_count: number
    }
  }
  base: {
    label: string
    ref: string
    sha: string
    user: {
      login: string
      id: number
      node_id: string
      avatar_url: string
      gravatar_id: string
      url: string
      html_url: string
      followers_url: string
      following_url: string
      gists_url: string
      starred_url: string
      subscriptions_url: string
      organizations_url: string
      repos_url: string
      events_url: string
      received_events_url: string
      type: string
      site_admin: boolean
    }
    repo: {
      id: number
      node_id: string
      name: string
      full_name: string
      owner: {
        login: string
        id: number
        node_id: string
        avatar_url: string
        gravatar_id: string
        url: string
        html_url: string
        followers_url: string
        following_url: string
        gists_url: string
        starred_url: string
        subscriptions_url: string
        organizations_url: string
        repos_url: string
        events_url: string
        received_events_url: string
        type: string
        site_admin: boolean
      }
      private: boolean
      html_url: string
      description: string
      fork: boolean
      url: string
      archive_url: string
      assignees_url: string
      blobs_url: string
      branches_url: string
      collaborators_url: string
      comments_url: string
      commits_url: string
      compare_url: string
      contents_url: string
      contributors_url: string
      deployments_url: string
      downloads_url: string
      events_url: string
      forks_url: string
      git_commits_url: string
      git_refs_url: string
      git_tags_url: string
      git_url: string
      issue_comment_url: string
      issue_events_url: string
      issues_url: string
      keys_url: string
      labels_url: string
      languages_url: string
      merges_url: string
      milestones_url: string
      notifications_url: string
      pulls_url: string
      releases_url: string
      ssh_url: string
      stargazers_url: string
      statuses_url: string
      subscribers_url: string
      subscription_url: string
      tags_url: string
      teams_url: string
      trees_url: string
      clone_url: string
      mirror_url: string
      hooks_url: string
      svn_url: string
      homepage: string
      language: string
      forks_count: number
      stargazers_count: number
      watchers_count: number
      size: number
      default_branch: string
      open_issues_count: number
      is_template: boolean
      topics: string[]
      has_issues: boolean
      has_projects: boolean
      has_wiki: boolean
      has_pages: boolean
      has_downloads: boolean
      archived: boolean
      disabled: boolean
      visibility: string
      pushed_at: string
      created_at: string
      updated_at: string
      permissions: {
        admin: boolean
        push: boolean
        pull: boolean
      }
      allow_rebase_merge: boolean
      template_repository: {
        [k: string]: unknown
      }
      temp_clone_token: string
      allow_squash_merge: boolean
      delete_branch_on_merge: boolean
      allow_merge_commit: boolean
      subscribers_count: number
      network_count: number
    }
  }
  _links: {
    self: {
      href: string
    }
    html: {
      href: string
    }
    issue: {
      href: string
    }
    comments: {
      href: string
    }
    review_comments: {
      href: string
    }
    review_comment: {
      href: string
    }
    commits: {
      href: string
    }
    statuses: {
      href: string
    }
  }
  author_association: string
  draft: boolean
  merged: boolean
  mergeable: boolean
  rebaseable: boolean
  mergeable_state: string
  merged_by: {
    login: string
    id: number
    node_id: string
    avatar_url: string
    gravatar_id: string
    url: string
    html_url: string
    followers_url: string
    following_url: string
    gists_url: string
    starred_url: string
    subscriptions_url: string
    organizations_url: string
    repos_url: string
    events_url: string
    received_events_url: string
    type: string
    site_admin: boolean
  }
  comments: number
  review_comments: number
  maintainer_can_modify: boolean
  commits: number
  additions: number
  deletions: number
  changed_files: number
}

export type PullsCreateResponseData1 = Endpoints['POST /repos/{owner}/{repo}/pulls']['response']
