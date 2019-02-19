let express = require('express');
let router = express.Router();
let query = require('../query/index')
/*let utils = require('./../utils/utils')
let keys = require('./../utils/key')*/

const crypto = require('crypto');

//查询城市
let pageSql = 'select count(*) from city; select * from city limit ? , ?'
router.get('/getCity', function (req, res, next) {
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
        res.send({code: 1, message: "success", totalPage: allPage, total: allCount, data: request[1]})
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

//添加用户
let addSql = 'insert into users(name, age, phone, address) values(?, ?, ?, ?)'
router.post('/addUser', function (req, res, next) {
    let name = req.body.name
    let age = parseFloat(req.body.age)
    let phone = req.body.phone
    let address = req.body.address
    console.log(name, age)
    query(addSql, [name, age, phone, address], function (request) {
        if (request.affectedRows == 1) {
            res.send({code: 1, message: "success", msg: '添加成功'})
        } else {
            res.send({code: 0, message: "Faild! 请重试"})
        }
    })
    console.log(JSON.stringify(req.body))
})

//删除用户
let deleteSql = 'delete from users where id = ?'
router.get('/deleteUser', function (req, res, next) {
    let id = parseFloat(req.query.id)
    console.log(id)
    query(deleteSql, [id], function (request) {
        console.log(JSON.stringify(request))
        if (request.affectedRows == 1) {
            res.send({code: '1', message: '删除成功'})
        } else {
            res.send({code: 0, message: 'faild'})
        }
    })
})

//更新用户
let updateSql = 'update users set name=?, age=?, phone=?, address=? where id=?'
router.post('/updateUser', function (req, res, next) {
    let name = req.body.name
    let age = parseFloat(req.body.age)
    let phone = req.body.phone
    let address = req.body.address
    let id = parseFloat(req.body.id)
    console.log(name, age, id)
    query(updateSql, [name, age, phone, address, id], function (request) {
        if (request.affectedRows == 1) {
            res.send({code: 1, message: 'success', data: request, msg: '修改成功'})
        } else {
            res.send({code: 0, message: "Faild! 请重试"})
        }
    })
})

//注册
let checkSql = 'select username from login where username = ?'
let registerSql = 'insert into login(username, password, role) values(?, ?, ?)'
router.post('/register', function (req, res, next) {
    let username = req.body.username
    let password = crypto.createHmac('md5', '123456').update(req.body.password).digest('hex');
    console.log(username, password)
    query(checkSql, [username], function (request) {
        if (request[0] !== undefined && request[0].username == username) {
            res.send({code: 0, message: 'faild', msg: '用户名已存在'})
        } else {
            console.log('chengogng')

            query(registerSql, [username, password, 0], function (request) {
                if (request.affectedRows == 1) {
                    res.send({code: 1, message: 'success', data: request, msg: '注册成功'})
                } else {
                    res.send({code: 0, message: "Faild! 请重试"})
                }
            })
        }
    })

})

//登陆
let loginSql = 'select * from login where username = ?'
router.post('/login', function (req, res) {
    let username = req.body.username
    let password = req.body.password
    query(loginSql, [username], function (request) {
        if (request[0] === undefined) {
            res.send({code: -1, message: 'faild', msg: '没有该用户'});
        }
        if (request[0].password == crypto.createHmac('md5', '123456').update(password).digest('hex')) {
            req.session.regenerate(function (err) {
                if (err) {
                    res.send({code: -1, message: 'faild', msg: '登录失败'})
                }
                req.session.loginUser = username
                res.send({code: 1, message: 'success', msg: '登录成功'})
            })
        } else {
            res.send({code: -1, message: 'faild', msg: '密码错误'})
        }

    })
})

//退出登录
router.get('/logout', function (req, res, next) {
    req.session.destroy(function (err) {
        if (err) {
            res.send({code: -1, message: 'faild', msg: '退出登录失败'})
            return
        }
        res.clearCookie()
        res.send({code: 1, message: 'success', msg: '退出登录'})
    })
})

module.exports = router;
