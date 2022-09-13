// // core.notice(`Pull Request #${ pullRequest.number } created/updated: ${ pullRequest.html_url }`)
// // https://github.com/test-repo-billy/azure-rest-api-specs/actions/runs/3006110715/jobs/4827162868
// import * as core from '@actions/core';
// // core.setFailed('You must provide either GH_PAT or GH_INSTALLATION_TOKEN')
// // process.exit(1)

// let context = {
//     // GITHUB_TOKEN: token,
//     // IS_INSTALLATION_TOKEN: isInstallationToken,
//     CONFIG_PATH: core.getInput({
//         key: 'CONFIG_PATH',
//         default: '.github/sync.yml'
//     }),
//     COMMIT_BODY: core.getInput({
//         key: 'COMMIT_BODY',
//         default: ''
//     }),
//     COMMIT_PREFIX: core.getInput({
//         key: 'COMMIT_PREFIX',
//         default: '🔄'
//     }),
//     COMMIT_EACH_FILE: core.getInput({
//         key: 'COMMIT_EACH_FILE',
//         type: 'boolean',
//         default: true
//     }),
//     CREATE_TREE_LIMIT: core.getInput({
//         key: 'CREATE_TREE_LIMIT',
//         type: 'number',
//         default: 500
//     }),
//     COMMIT_MESSAGE: core.getInput({
//         key: 'COMMIT_MESSAGE',
//         type: 'string',
//         default: ''
//     }),
//     PR_LABELS: core.getInput({
//         key: 'PR_LABELS',
//         default: [ 'sync' ],
//         type: 'array',
//         disableable: true
//     }),
//     PR_BODY: core.getInput({
//         key: 'PR_BODY',
//         default: ''
//     }),
//     ASSIGNEES: core.getInput({
//         key: 'ASSIGNEES',
//         type: 'array'
//     }),
//     REVIEWERS: core.getInput({
//         key: 'REVIEWERS',
//         type: 'array'
//     }),
//     TEAM_REVIEWERS: core.getInput({
//         key: 'TEAM_REVIEWERS',
//         type: 'array'
//     }),
//     TMP_DIR: core.getInput({
//         key: 'TMP_DIR',
//         default: `tmp-${ Date.now().toString() }`
//     }),
//     DRY_RUN: core.getInput({
//         key: 'DRY_RUN',
//         type: 'boolean',
//         default: false
//     }),
//     SKIP_CLEANUP: core.getInput({
//         key: 'SKIP_CLEANUP',
//         type: 'boolean',
//         default: false
//     }),
//     OVERWRITE_EXISTING_PR: core.getInput({
//         key: 'OVERWRITE_EXISTING_PR',
//         type: 'boolean',
//         default: true
//     }),
//     GITHUB_REPOSITORY: core.getInput({
//         key: 'GITHUB_REPOSITORY',
//         required: true
//     }),
//     SKIP_PR: core.getInput({
//         key: 'SKIP_PR',
//         type: 'boolean',
//         default: false
//     }),
//     ORIGINAL_MESSAGE: core.getInput({
//         key: 'ORIGINAL_MESSAGE',
//         type: 'boolean',
//         default: false
//     }),
//     COMMIT_AS_PR_TITLE: core.getInput({
//         key: 'COMMIT_AS_PR_TITLE',
//         type: 'boolean',
//         default: false
//     }),
//     BRANCH_PREFIX: core.getInput({
//         key: 'BRANCH_PREFIX',
//         default: 'repo-sync/SOURCE_REPO_NAME'
//     }),
//     FORK: core.getInput({
//         key: 'FORK',
//         default: false,
//         disableable: true
//     })
// }
