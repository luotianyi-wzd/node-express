//qiniu.js
const controllerQiniu = require('qn');
const config = require('./../conf');

const client = controllerQiniu.create(config.qiniu);
// var uploadToken = () => {
//     return client.uploadToken()
// }
var token = client.uploadToken();
module.exports = {token}