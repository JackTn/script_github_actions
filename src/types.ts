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
