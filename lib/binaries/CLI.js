/* eslint-disable no-undef */
const chalk = require('chalk');
const pkg = require('../../package.json');
const { program } = require('commander');
const { Config } = require('../config/config');
const { Bitbucket } = require('../API/bitbucket');

const { handleLogTable } = require('../utils/function');

program.version(pkg.version);

program
  .command('examples')
  .description('display bcm usage examples')
  .action(() => {
    console.log(chalk.bold('examples command'));
  });

program
  .command('version')
  .description('display bcm usage version')
  .action(() => {
    console.log(pkg.version);
  });

program
  .command('get [key]')
  .description('display list config or config by key')
  .action(key => {
    const conf = new Config();
    if (!key) {
      return console.log(conf.getConfig());
    }
    const objKey = conf.getConfig(key);
    if (objKey.error) {
      return console.log(objKey.message);
    }
    return console.log(objKey[key]);
  });

program
  .command('set')
  .option('--basic-auth-username <username>', 'set your username of bitbucket')
  .option('--basic-auth-password <password>', 'set your password of bitbucket')
  .option(
    '--default-branch-auto-merge <branch>',
    'default will be merge if create pull into this branch',
  )
  .option(
    '--default-branch-reset-from <branch>',
    'default will be recreate from this branch - only for command "reset"',
  )
  .option(
    '--default-branch-reset <branch>',
    'this branch default will be reset- only for command "reset"',
  )
  .option(
    '--default-branch-create-from <branch>',
    'default will be create from this branch',
  )
  .option(
    '--default-branch-open-pull <branch>',
    'default will be open pull request from this branch',
  )
  .option(
    '--default-workspace <workspace>',
    'set default workspace of repositories',
  )
  .description('set config')
  .action(opts => {
    const conf = new Config();
    const {
      basicAuthUsername,
      basicAuthPassword,
      defaultBranchAutoMerge,
      defaultBranchResetFrom,
      defaultBranchReset,
      defaultBranchCreateFrom,
      defaultBranchOpenPull,
      defaultWorkspace,
    } = opts;
    conf.initConfig({
      basicAuthUsername,
      basicAuthPassword,
      defaultBranchAutoMerge,
      defaultBranchCreateFrom,
      defaultBranchResetFrom,
      defaultBranchOpenPull,
      defaultBranchReset,
      defaultWorkspace,
    });
  });

program
  .command('alias')
  .description('Get aliasId for repositories')
  .alias('a')
  .option('-s, --search <keyword>', 'search repositories by keyword')
  .action(opts => {
    const { search } = opts;
    const Conf = new Config();
    const listRepoName = Conf.getConfig('alias');
    if (listRepoName.error) {
      return console.log(chalk.bold(chalk.red('Not set config for alias')));
    }
    let tableList = listRepoName.alias.map((value, index) => {
      return [value, index];
    });
    if (search) {
      tableList = tableList.filter(itm => itm[0].includes(search));
    }

    const table = handleLogTable(
      tableList,
      ['repoName', 'aliasId'],
    );
    console.log(table);
  });

program
  .command('repo')
  .description(
    'display list repositories of default workspace or option workspace',
  )
  .option('-w, --workspace <workspace>', 'set a workspace of repositories')
  .option('--set-index-alias', 'set alias Id for repositories')
  .action(async opts => {
    const { setIndexAlias, workspace } = opts;
    const Conf = new Config();
    const bitbucket = new Bitbucket(Conf);
    console.log(await bitbucket.listRepo(workspace, setIndexAlias));
  });

program
  .command('new <repoName|aliasId> <branch> [source]')
  .description('create branch')
  .option('-w, --workspace <workspace>', 'workspace of repositories')
  .alias('n')
  .action(async (repo, branch, source, opts) => {
    const Conf = new Config();
    const bitbucket = new Bitbucket(Conf);
    const { workspace } = opts;
    console.log(await bitbucket.createRef(workspace, repo, branch, source));
  });

program
  .command('delete <repoName|aliasId> <branch>')
  .description('delete branch')
  .option('-w, --workspace <workspace>', 'workspace of repositories')
  .alias('d')
  .action(async (repo, branch, opts) => {
    const Conf = new Config();
    const bitbucket = new Bitbucket(Conf);
    const { workspace } = opts;
    console.log(await bitbucket.deleteRef(workspace, repo, branch));
  });

program
  .command('reset <repoName|aliasId> <branch> [source]')
  .description('reset branch')
  .option('-w, --workspace <workspace>', 'workspace of repositories')
  .alias('r')
  .action(async (repo, branch, source, opts) => {
    const Conf = new Config();
    const bitbucket = new Bitbucket(Conf);
    const { workspace } = opts;
    console.log(await bitbucket.resetRef(workspace, repo, branch, source));
  });

program
  .command('open <repoName|aliasId> <branch> [destination]')
  .description('open pull')
  .alias('o')
  .option('-w, --workspace <workspace>', 'workspace of repositories')
  .option('-t, --title <title>', 'title of pull request')
  .option('-m, --auto-merge', 'auto merge branch', false)
  .action(async (repo, branch, destination, opts) => {
    const { autoMerge, workspace, title } = opts;
    const Conf = new Config();
    const bitbucket = new Bitbucket(Conf);
    console.log(
      await bitbucket.openPull(
        workspace,
        repo,
        branch,
        destination,
        title,
        autoMerge,
      ),
    );
  });

program
  .command('merge <repo> <pullId>')
  .description('merge pull request')
  .alias('m')
  .action(async (repo, pullId, opts) => {
    const Conf = new Config();
    const bitbucket = new Bitbucket(Conf);
    const { workspace } = opts;
    console.log(await bitbucket.mergePull(workspace, repo, pullId));
  });

program.command('*').action(function () {
  console.log(chalk.bold(chalk.red('Command not found\n')));
});

program.parse(process.argv);
