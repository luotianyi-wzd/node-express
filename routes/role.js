let express = require('express');
let router = express.Router();
let query = require('../query/index')
/*let utils = require('./../utils/utils')
let keys = require('./../utils/key')*/

const crypto = require('crypto');

//查询所有登录账户
let pageSql = 'select count(*) from login; select id,username,create_time,role from login order by id desc limit ? , ?'
router.get('/getRole', function (req, res, next) {
    let pageNum = parseFloat(req.query.pageNum) ? parseFloat(req.query.pageNum) : 1
    let pageSize = parseFloat(req.query.pageSize) ? parseFloat(req.query.pageSize) : 10
    let curPage = pageSize * (pageNum - 1)
    let params = [curPage, pageSize]
    console.log(params)
    query(pageSql, params, function (request) {
        console.log(JSON.stringify(request))
        let allCount = request[0][0]['count(*)']
        let allPage = parseInt(allCount) / pageSize;
        let pageStr = allPage.toString();
        if (pageStr.indexOf('.') > 0) {
            allPage = parseInt(pageStr.split('.')[0]) + 1;
        }
        res.send({code: 1, message: "success",msg: '请求成功', totalPage: allPage, total: allCount, data: request[1]})
    })
})

//查询用户
let usersSql = 'select count(*) from users; select * from users order by create_time desc limit ? , ? '
router.get('/getUser', function (req, res, next) {
    let loginUser = req.session.loginUser

    let pageNum = parseFloat(req.query.pageNum) ? parseFloat(req.query.pageNum) : 1
    let pageSize = parseFloat(req.query.pageSize) ? parseFloat(req.query.pageSize) : 10
    let curPage = pageSize * (pageNum - 1)
    let params = [curPage, pageSize]
    console.log(params)
    query(usersSql, params, function (request) {
        console.log(JSON.stringify(request))
        let allCount = request[0][0]['count(*)']
        let allPage = parseInt(allCount) / pageSize;
        let pageStr = allPage.toString();
        if (pageStr.indexOf('.') > 0) {
            allPage = parseInt(pageStr.split('.')[0]) + 1;
        }
        res.send({code: 1, message: "success", totalPage: allPage, total: allCount, data: request[1]})
    })
})

//更新用户
let updateSql = 'update login set role=? where id=?'
router.post('/changeRole', function (req, res, next) {
    let id = parseFloat(req.body.id)
    let role = parseFloat(req.body.role)
    query(updateSql, [role, id], function (request) {
        if (request.affectedRows == 1) {
            res.send({code: 1, message: 'success', data: request, msg: '修改成功'})
        } else {
            res.send({code: 0, message: "Faild",msg:'请重试'})
        }
    })
})

module.exports = router;
