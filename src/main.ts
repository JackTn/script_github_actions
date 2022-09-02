import * as core from '@actions/core'
import {run} from './handle'
import * as github from '@actions/github'

const item = {
    repo: {
        name: '',
        user: '',
        fullName: '',
        branch: 'RPSaaSMaster'
    },
    files: ['specification/common-types']
}

core.info(`Repository Info`)
core.info(`Slug		: ${ item.repo.name }`)
core.info(`Owner		: ${ item.repo.user }`)
core.info(`Https Url	: https://${ item.repo.fullName }`)
core.info(`Branch		: ${ item.repo.branch }`)
core.info('	')

async function exec() {
  const octokit = github.getOctokit('')
  // You can also pass in additional options as a second parameter to getOctokit
  // const octokit = github.getOctokit(myToken, {userAgent: "MyActionVersion1"});

  const allLabels = await octokit.issues.listLabelsForRepo({
    owner: 'test-repo-billy',
    repo: 'azure-rest-api-specs'
  })
  console.log(allLabels)

  // get app installation_id
  //await octokit.request('GET /installation/repositories', {})
  
  //   const token = core.getInput('github-token')
  //   // const token = process.env['INPUT_GITHUB_TOKEN'] as string
  //   run(token)
}

exec()
