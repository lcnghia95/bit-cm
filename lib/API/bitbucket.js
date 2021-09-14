const {
  bitbucketPost,
  bitbucketGet,
  bitbucketDelete,
} = require('../utils/bitbucketCaller');
const chalk = require('chalk');
const { getUrlTemplate, handleLogTable } = require('../utils/function');
const {
  BITBUCKET_API_URL_TEMPLATE,
  BITBUCKET_CLOUD_URL,
} = require('../utils/constant');
const { get, map } = require('lodash');

class Bitbucket {
  constructor(conf) {
    this.configService = conf;
    this.config = this.configService.getConfig();
    this.auth = {
      username: this.config.basicAuthUsername,
      password: this.config.basicAuthPassword,
    };
    this.defaultBranchAutoMerge = this.config.defaultBranchAutoMerge;
    this.defaultBranchCreateFrom = this.config.defaultBranchCreateFrom;
    this.defaultBranchResetFrom = this.config.defaultBranchResetFrom;
    this.defaultBranchReset = this.config.defaultBranchReset;
    this.defaultWorkspace = this.config.defaultWorkspace;
    this.defaultBranchOpenPull = this.config.defaultBranchOpenPull;
    this.alias = this.config.alias;
  }

  /**
   *
   * @param {string} repo
   * @returns {string}
   */
  _correctRepo(repo) {
    if (!this.alias.includes(repo)) {
      repo = this.alias[repo];
    }
    return repo;
  }

  /**
   *
   * @param {string} workspace
   * @returns {string}
   */
  _correctWorkspace(workspace) {
    return workspace || this.defaultWorkspace;
  }

  /**
   *
   * @param {string} repo
   * @param {string} name
   * @returns {Object}
   */
  async _getHashBranch(repo, name) {
    const url = getUrlTemplate(BITBUCKET_API_URL_TEMPLATE.GET_BRANCH, {
      workspace: this.defaultWorkspace,
      repo,
      name,
    });
    return await bitbucketGet(url, { auth: this.auth });
  }

  /**
   *
   * @param {string} workspace
   * @param {string} repo
   * @param {string} pullId
   * @returns {Object}
   */
  async _mergePull(workspace, repo, pullId) {
    const url = getUrlTemplate(BITBUCKET_API_URL_TEMPLATE.MERGE_PULL, {
      workspace,
      repo,
      pullId,
    });
    return await bitbucketPost(url, {}, { auth: this.auth });
  }

  /**
   *
   * @param {string} workspace
   * @param {string} repo
   * @param {string} head
   * @param {string} dest
   * @param {string} title
   * @returns {Object}
   */
  async _createPull(workspace, repo, head, dest, title) {
    const url = getUrlTemplate(BITBUCKET_API_URL_TEMPLATE.CREATE_PULL, {
      workspace,
      repo,
    });
    if (!title) title = head;
    return await bitbucketPost(
      url,
      {
        title,
        source: {
          branch: {
            name: head,
          },
        },
        destination: {
          branch: {
            name: dest,
          },
        },
      },
      { auth: this.auth },
    );
  }

  /**
   *
   * @param {string} workspace
   * @param {string} repo
   * @param {string} branch
   * @param {string} hash
   * @returns {Object}
   */
  async _createRef(workspace, repo, branch, source) {
    const resHash = await this._getHashBranch(repo, source);
    if (resHash.error) {
      return resHash;
    }

    const hash = get(resHash, 'target.hash');
    const url = getUrlTemplate(BITBUCKET_API_URL_TEMPLATE.CREATE_BRANCH, {
      workspace,
      repo,
    });

    return await bitbucketPost(
      url,
      {
        name: branch,
        target: {
          hash,
        },
      },
      { auth: this.auth },
    );
  }

  /**
   *
   * @param {string} workspace
   * @param {boolean} isSetAlias
   * @returns {string}
   */
  async listRepo(workspace, isSetAlias = false) {
    workspace = this._correctWorkspace(workspace);
    if (!workspace) {
      return chalk.bold(chalk.red(`Error: Workspace \`${workspace}\` not set`));
    }

    const url = getUrlTemplate(BITBUCKET_API_URL_TEMPLATE.REPOLIST, {
      workspace,
    });

    const res = await bitbucketGet(`${url}?pagelen=100`, { auth: this.auth });
    if (res.error) {
      console.log(chalk.bold(chalk.red(res.message)));
    }

    const listName = map(res.values, 'name');
    if (isSetAlias) {
      this.configService.setConfig('alias', listName);
    }

    return listName.join('\n');
  }

  /**
   *
   * @param {string} workspace
   * @param {string} repo
   * @param {string} branch
   * @param {string} source
   * @param {boolean} isCorrectRepo
   * @returns
   */
  async createRef(
    workspace,
    repo,
    branch,
    source = this.defaultBranchCreateFrom,
  ) {
    workspace = this._correctWorkspace(workspace);
    if (!workspace) {
      return chalk.bold(chalk.red(`Error: Workspace \`${workspace}\` not set`));
    }

    repo = this._correctRepo(repo);
    if (!repo) {
      return chalk.bold(
        chalk.red(
          `Error: Repo \`${repo}\` not found, please check in alias list`,
        ),
      );
    }

    const res = await this._createRef(workspace, repo, branch, source);
    if (res.error) {
      return chalk.bold(chalk.red(res.message));
    }

    return handleLogTable({
      workspace,
      repo,
      branch,
      source,
      message: 'Create branch susscesful',
      link: get(res, 'links.html.href'),
    });
  }

  /**
   *
   * @param {*} workspace
   * @param {*} repo
   * @param {*} branch
   * @param {*} isCorrectRepo
   * @returns {string}
   */
  async deleteRef(workspace, repo, branch) {
    workspace = this._correctWorkspace(workspace);
    if (!workspace) {
      return chalk.bold(chalk.red(`Error: Workspace \`${workspace}\` not set`));
    }

    repo = this._correctRepo(repo);
    if (!repo) {
      return chalk.bold(
        chalk.red(
          `Error: Repo \`${repo}\` not found, please check in alias list`,
        ),
      );
    }

    const res = await this._deleteRef(workspace, repo, branch);
    if (res.error) {
      return res.statusCode === 404 ? 'Error: Branch not found' : res.message;
    }

    return handleLogTable({
      workspace,
      repo,
      branch,
      message: 'Delete branch succesful',
    });
  }

  /**
   *
   * @param {string} workspace
   * @param {string} repo
   * @param {string} branch
   * @param {string} from
   * @returns {string}
   */
  async resetRef(
    workspace,
    repo,
    branch = this.defaultBranchReset,
    from = this.defaultBranchResetFrom,
  ) {
    workspace = this._correctWorkspace(workspace);
    if (!workspace) {
      return chalk.bold(chalk.red(`Error: Workspace \`${workspace}\` not set`));
    }

    repo = this._correctRepo(repo);
    if (!repo) {
      return chalk.bold(
        chalk.red(
          `Error: Repo \`${repo}\` not found, please check in alias list`,
        ),
      );
    }

    const resDelete = await this._deleteRef(workspace, repo, branch);
    if (resDelete.error) {
      return resDelete.statusCode === 404
        ? 'Error: Branch not found'
        : resDelete.message;
    }

    const resCreate = await this._createRef(workspace, repo, branch, from);
    if (resCreate.error) {
      return resCreate.statusCode === 404
        ? 'Error: Branch not found'
        : resCreate.message;
    }

    return handleLogTable({
      workspace,
      repo,
      resetBranch: branch,
      resetFromBranch: from,
      message: 'Reset branch succesful',
    });
  }

  /**
   *
   * @param {string} workspace
   * @param {string} repo
   * @param {string} branch
   * @param {string} dest
   * @param {string} title
   * @param {boolean} autoMerge
   * @returns {string}
   */
  async openPull(
    workspace,
    repo,
    branch,
    dest = this.defaultBranchOpenPull,
    title,
    autoMerge,
  ) {
    workspace = this._correctWorkspace(workspace);
    if (!workspace) {
      return chalk.bold(chalk.red(`Error: Workspace \`${workspace}\` not set`));
    }

    repo = this._correctRepo(repo);
    if (!repo) {
      return chalk.bold(
        chalk.red(
          `Error: Repo \`${repo}\` not found, please check in alias list`,
        ),
      );
    }

    const resCreate = await this._createPull(
      workspace,
      repo,
      branch,
      dest,
      title || branch,
    );
    if (resCreate.error) {
      return resCreate.message;
    }

    const pullId = get(resCreate, 'id');
    if (dest === this.defaultBranchAutoMerge || autoMerge) {
      const res = await this._mergePull(workspace, repo, pullId);
      if (!res.error) {
        return handleLogTable({
          workspace,
          repo,
          sourceBranch: branch,
          destBranch: dest,
          title: get(resCreate, 'title'),
          message: 'Open pull request and merge succuesful',
          link:
            get(res, 'links.html.href') ||
            getUrlTemplate(BITBUCKET_CLOUD_URL.PULLREUEST, {
              workspace,
              repo,
              pullId,
            }),
        });
      }
    }

    return handleLogTable({
      workspace,
      repo,
      sourceBranch: branch,
      destBranch: dest,
      title: get(resCreate, 'title'),
      message: 'Open pull request succuesful',
      link: get(resCreate, 'links.html.href'),
      mergeCommand: `bcm merge ${repo} ${pullId}`,
    });
  }

  /**
   *
   * @param {string} workspace
   * @param {string} repo
   * @param {string} pullId
   * @returns
   */
  async mergePull(workspace, repo, pullId) {
    workspace = this._correctWorkspace(workspace);
    if (!workspace) {
      return chalk.bold(chalk.red(`Error: Workspace \`${workspace}\` not set`));
    }

    repo = this._correctRepo(repo);
    if (!repo) {
      return chalk.bold(
        chalk.red(
          `Error: Repo \`${repo}\` not found, please check in alias list`,
        ),
      );
    }

    const res = await this._mergePull(workspace, repo, pullId);
    if (res.error) {
      return chalk.bold(chalk.red(res.message));
    }

    return handleLogTable({
      workspace,
      repo,
      pullId,
      message: 'Merge pull succesful',
      link:
        get(res, 'links.html.href') ||
        getUrlTemplate(BITBUCKET_CLOUD_URL.PULLREUEST, {
          workspace,
          repo,
          pullId,
        }),
    });
  }

  /**
   *
   * @param {string} workspace
   * @param {string} repo
   * @param {string} branch
   * @returns
   */
  async _deleteRef(workspace, repo, branch) {
    const resHash = await this._getHashBranch(repo, branch);
    if (resHash.error) {
      return {
        error: true,
        message: chalk.bold(chalk.red(`Error: Branch \`${branch}\` not found`)),
      };
    }

    const url = getUrlTemplate(BITBUCKET_API_URL_TEMPLATE.DELETE_BRANCH, {
      workspace,
      repo,
      name: branch,
    });

    return await bitbucketDelete(url, {}, { auth: this.auth });
  }
}

exports.Bitbucket = Bitbucket;
