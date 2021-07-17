const Table = require('cli-table');
const { isObject, isArray } = require('lodash');

/**
 *
 * @param {Object} data
 * @param {Array} field
 * @returns {Object}
 */
const filterObject = (data, field = []) => {
  const filterData = {};
  const newData = !field.length ? Object.keys(data) : field;
  newData.forEach(element => {
    data[element] && (filterData[element] = data[element]);
  });
  return filterData;
};

/**
 *
 * @param {string} templateString
 * @param {object} parameter
 * @returns {string}
 */
const getUrlTemplate = (templateString, parameter) => {
  return new Function(`return \`${templateString}\`;`).call(parameter);
};

/**
 *
 * @param {array|object} data
 * @param {array} head
 * @returns {string}
 */
const handleLogTable = (data, head = ['column', 'value']) => {
  const table = new Table({
    style: { head: ['yellow'] },
    head,
    chars: {
      top: '═',
      'top-mid': '╤',
      'top-left': '╔',
      'top-right': '╗',
      bottom: '═',
      'bottom-mid': '╧',
      'bottom-left': '╚',
      'bottom-right': '╝',
      left: '║',
      'left-mid': '╟',
      mid: '─',
      'mid-mid': '┼',
      right: '║',
      'right-mid': '╢',
      middle: '│',
    },
    colors: false,
  });
  // object key value level 1
  // {a:b}
  if (isObject(data) && !isArray(data)) {
    Object.keys(data).map(key => {
      table.push([key, data[key]]);
    });
  }
  // array 2d
  // [[],[]]
  if (isArray(data)) {
    data.map(itm => {
      table.push(itm);
    });
  }
  return table.toString();
};

module.exports = {
  filterObject,
  getUrlTemplate,
  handleLogTable,
};
