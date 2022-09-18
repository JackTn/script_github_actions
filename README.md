# github-action for repo file sync 

### workflow
- get change files from source repo
- get Tree from dest repo
- delete file from dest repo by path
- merge changes files and dest repo files
- create all tree & create commit
- create pr

### use this action
* use [actions/checkout@v2](https://github.com/marketplace/actions/checkout) first
* see action.yml in root directory that the parameter used
* last below your .github/workflows folder add your action yml

### debug locally & run github action locally
* debug locally : create .env file in your root directory and set **source** parameter that src/main.ts by hand
* debug github action locally: download docker before and npm install [act](https://github.com/nektos/act) -g then run act command to debug locally
  
_notice: when you use act the github environment like tooken sould use truth_


### dependencies
- [github action document](https://docs.github.com/en/actions)
- [@actions/core](https://github.com/actions/toolkit/tree/main/packages/core)
- [@actions/github](https://github.com/actions/toolkit/tree/main/packages/github)

