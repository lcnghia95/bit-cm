const BITBUCKET_API_URL_TEMPLATE = {
  REPOLIST: 'repositories/${this.workspace}',
  CREATE_BRANCH: 'repositories/${this.workspace}/${this.repo}/refs/branches',
  GET_BRANCH:
    'repositories/${this.workspace}/${this.repo}/refs/branches/${this.name}',
  DELETE_BRANCH:
    'repositories/${this.workspace}/${this.repo}/refs/branches/${this.name}',
  CREATE_PULL: 'repositories/${this.workspace}/${this.repo}/pullrequests',
  MERGE_PULL:
    'repositories/${this.workspace}/${this.repo}/pullrequests/${this.pullId}/merge',
};

const BITBUCKET_CLOUD_URL = {
  PULLREUEST:
    'https://bitbucket.org/${this.workspace}/${this.repo}/pull-requests/${this.pullId}',
};

const BITBUCKET_API_URL = 'https://api.bitbucket.org/2.0/';

module.exports = {
  BITBUCKET_API_URL_TEMPLATE,
  BITBUCKET_API_URL,
  BITBUCKET_CLOUD_URL,
};
