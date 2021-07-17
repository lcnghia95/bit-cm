const axios = require('axios');
const { BITBUCKET_API_URL } = require('../utils/constant');
const { get } = require('lodash');

/**
 *
 * @param {string} method
 * @param {string} url
 * @param {Object} data
 * @param {Object} option
 * @returns {Object}
 */
const makeRequest = async (method, url, data = {}, option = {}) => {
  try {
    let response;
    if (['get', 'delete'].includes(method.toLowerCase())) {
      response = await axios[method.toLowerCase()](url, option);
    } else response = await axios[method.toLowerCase()](url, data, option);
    if (response.status >= 200 && response.status <= 299) {
      return response.data;
    }
  } catch (e) {
    return {
      error: true,
      statusCode: get(e, 'response.status'),
      message: get(e, 'response.data.error.message'),
    };
  }
};

/**
 *
 * @param {string} url
 * @param {Object} data
 * @param {object{Object}} options
 * @returns {Object}
 */
const bitbucketPost = async (url, data = {}, options = {}) => {
  try {
    url = BITBUCKET_API_URL + url;
    return await makeRequest('post', url, data, options);
  } catch (e) {
    return { error: e };
  }
};

/**
 *
 * @param {string} url
 * @param {Object} options
 * @returns {Object}
 */
const bitbucketGet = async (url, options = {}) => {
  try {
    url = BITBUCKET_API_URL + url;
    return await makeRequest('get', url, {}, options);
  } catch (e) {
    return { error: e };
  }
};

/**
 *
 * @param {string} url
 * @param {Object} data
 * @param {Object} options
 * @returns {Object}
 */
const bitbucketDelete = async (url, data = {}, options = {}) => {
  try {
    url = BITBUCKET_API_URL + url;
    return await makeRequest('delete', url, data, options);
  } catch (e) {
    return { error: e };
  }
};

module.exports = { makeRequest, bitbucketPost, bitbucketGet, bitbucketDelete };
