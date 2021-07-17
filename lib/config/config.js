const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { filterObject } = require('../utils/function');
class Config {
  constructor() {
    this.homeBcm = path.join(process.env.HOME || process.env.HOMEPATH, '.bcm');
    this.pathConfig = path.join(
      process.env.HOME || process.env.HOMEPATH,
      '.bcm/config.json',
    );
    if (!fs.existsSync(this.homeBcm)) {
      fs.mkdirSync(this.homeBcm, { recursive: true });
    }
    if (!fs.existsSync(this.pathConfig)) {
      fs.writeFileSync(this.pathConfig, '{}');
    }
  }

  /**
   *
   * @param {Object} objData
   */
  initConfig(objData) {
    const objInit = filterObject(objData, [
      'basicAuthUsername',
      'basicAuthPassword',
      'defaultBranchAutoMerge',
      'defaultBranchCreateFrom',
      'defaultBranchResetFrom',
      'defaultBranchReset',
      'defaultBranchOpenPull',
      'defaultWorkspace',
    ]);
    const objConfig = this.getConfig();
    fs.writeFileSync(
      this.pathConfig,
      JSON.stringify(Object.assign(objConfig, objInit)),
    );
  }

  /**
   *
   * @param {string} key
   * @returns {Object}
   */
  getConfig(key) {
    const strConfig = fs.readFileSync(this.pathConfig);
    const objConfig = JSON.parse(strConfig);
    if (!key) {
      return objConfig;
    }
    if (!objConfig[key]) {
      return {
        error: true,
        message: `Key ${key} not found in list config`,
      };
    }
    return {
      [key]: objConfig[key],
    };
  }

  /**
   *
   * @param {string} key
   * @param {any} value
   * @returns {string}
   */
  setConfig(key, value) {
    if (!key || !value) {
      return chalk.bold(chalk.red('key and value is required'));
    }
    const objConfig = this.getConfig();
    objConfig[key] = value;
    fs.writeFileSync(this.pathConfig, JSON.stringify(objConfig));
  }
}

exports.Config = Config;
