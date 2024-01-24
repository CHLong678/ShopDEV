const _ = require("lodash");

const getInforData = ({ fileds = [], object = {} }) => {
  return _.pick(object, fileds);
};

module.exports = {
  getInforData,
};
