var express = require('express');
var router = express.Router();
var query = require('../query/index')
/*var utils = require('./../utils/utils')
var keys = require('./../utils/key')*/
var token = require('./qiniu')
/* GET users listing. */
const crypto = require('crypto');
let hmac = crypto.createHmac('md5', '123456');

router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

//查询城市
var pageSql = 'select count(*) from city; select * from city limit ? , ?'
router.get('/getCity', function (req, res, next) {
    var pageNum = parseFloat(req.query.pageNum) ? parseFloat(req.query.pageNum) : 1
    var pageSize = parseFloat(req.query.pageSize) ? parseFloat(req.query.pageSize) : 10
    var curPage = pageSize * (pageNum - 1)
    var params = [curPage, pageSize]
    console.log(params)
    query(pageSql, params, function (request) {
        console.log(JSON.stringify(request))
        var allCount = request[0][0]['count(*)']
        var allPage = parseInt(allCount) / pageSize;
        var pageStr = allPage.toString();
        if (pageStr.indexOf('.') > 0) {
            allPage = parseInt(pageStr.split('.')[0]) + 1;
        }
        res.send({code: 1, message: "Success!", totalPage: allPage, total: allCount, data: request[1]})
    })
})

//查询用户
var usersSql = 'select count(*) from users; select * from users order by create_time desc limit ? , ? '
router.get('/getUser', function (req, res, next) {
    var loginUser = req.session.loginUser

    var pageNum = parseFloat(req.query.pageNum) ? parseFloat(req.query.pageNum) : 1
    var pageSize = parseFloat(req.query.pageSize) ? parseFloat(req.query.pageSize) : 10
    var curPage = pageSize * (pageNum - 1)
    var params = [curPage, pageSize]
    console.log(params)
    query(usersSql, params, function (request) {
        console.log(JSON.stringify(request))
        var allCount = request[0][0]['count(*)']
        var allPage = parseInt(allCount) / pageSize;
        var pageStr = allPage.toString();
        if (pageStr.indexOf('.') > 0) {
            allPage = parseInt(pageStr.split('.')[0]) + 1;
        }
        res.send({code: 1, message: "Success!", totalPage: allPage, total: allCount, data: request[1]})
    })
})

//添加用户
var addSql = 'insert into users(name, age, phone, address) values(?, ?, ?, ?)'
router.post('/addUser', function (req, res, next) {
    var name = req.body.name
    var age = parseFloat(req.body.age)
    var phone = req.body.phone
    var address = req.body.address
    console.log(name, age)
    query(addSql, [name, age, phone, address], function (request) {
        if (request.affectedRows == 1) {
            res.send({code: 1, message: "Success!", msg: '添加成功'})
        } else {
            res.send({code: 0, message: "Faild! 请重试"})
        }
    })
    console.log(JSON.stringify(req.body))
})

//删除用户
var deleteSql = 'delete from users where id = ?'
router.get('/deleteUser', function (req, res, next) {
    var id = parseFloat(req.query.id)
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
var updateSql = 'update users set name=?, age=?, phone=?, address=? where id=?'
router.post('/updateUser', function (req, res, next) {
    var name = req.body.name
    var age = parseFloat(req.body.age)
    var phone = req.body.phone
    var address = req.body.address
    var id = parseFloat(req.body.id)
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
var checkSql = 'select username from login where username = ?'
var registerSql = 'insert into login(username, password) values(?, ?)'
router.post('/register', function (req, res, next) {
    var username = req.body.username
    var password = crypto.createHmac('md5', '123456').update(req.body.password).digest('hex');
    console.log(username, password)
    query(checkSql, [username], function (request) {
        console.log(request)
        if (request[0] !== undefined && request[0].username == username) {
            res.send({code: 0, message: 'faild', msg: '用户名已存在'})
        } else {
            console.log('chengogng')

            query(registerSql, [username, password], function (request) {
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
var loginSql = 'select * from login where username = ?'
router.post('/login', function (req, res) {
    var username = req.body.username
    var password = req.body.password
    query(loginSql, [username], function (request) {
        console.log(request)
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

//传七牛云token
var getImgSql = 'select * from imgs'
router.get('/qiniu', function (req, res, next) {

    query(getImgSql, [], function (request) {
        res.send({code: 1, message: "Success!", data: Object.assign({}, {list:request},{url: 'http://plqgdover.bkt.clouddn.com/'}, token)})
    })
})

//提交照片
var imgSql = 'insert into imgs(url) values(?)'
router.get('/upload', function (req, res, next) {
    let url = req.query.key
    query(imgSql, [url], function (request) {
        if (request.affectedRows == 1) {
            res.send({code: 1, message: "Success!", msg: '添加成功'})
        } else {
            res.send({code: 0, message: "Faild! 请重试"})
        }
    })
    console.log(JSON.stringify(req.body))
})
module.exports = router;