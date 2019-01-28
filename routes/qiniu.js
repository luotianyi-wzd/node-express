//qiniu.js
const controllerQiniu = require('qn');
const config = require('./../conf');
const request = require('request');

const client = controllerQiniu.create(config.qiniu);
var token = client.uploadToken();

module.exports = { token }