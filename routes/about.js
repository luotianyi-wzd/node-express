let express = require('express');
let router = express.Router();
let query = require('../query/index')
let formidable = require('formidable');
const path = require('path')
const fs = require('fs')
/*let utils = require('./../utils/utils')
let keys = require('./../utils/key')*/
let token = require('./qiniu')

const crypto = require('crypto');
const request = require('request');

//查询数据
let usersSql = 'select count(*) from about; select * from about order by create_time desc limit ? , ? '
router.get('/getData', function (req, res, next) {
    let pageNum = parseFloat(req.query.pageNum) ? parseFloat(req.query.pageNum) : 1
    let pageSize = parseFloat(req.query.pageSize) ? parseFloat(req.query.pageSize) : 10
    let curPage = pageSize * (pageNum - 1)
    let params = [curPage, pageSize]
    query(usersSql, params, function (request) {
        let allCount = request[0][0]['count(*)']
        let allPage = parseInt(allCount) / pageSize;
        let pageStr = allPage.toString();
        if (pageStr.indexOf('.') > 0) {
            allPage = parseInt(pageStr.split('.')[0]) + 1;
        }
        res.send({code: 1, message: "success", totalPage: allPage, total: allCount, data: request[1]})
    })
})

//添加数据
let addSql = 'insert into about(name, description, picture, status) values(?, ?, ?, ?)'
router.post('/addData', function (req, res, next) {
    let form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = path.join(__dirname + "/../page/upload");
    form.keepExtensions = true;//保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024;
    //处理图片
    form.parse(req, function (err, fields, files) {
        let filename = files.file.name
        let nameArray = filename.split('.');
        let type = nameArray[nameArray.length - 1];
        let name = '';
        for (let i = 0; i < nameArray.length - 1; i++) {
            name = name + nameArray[i];
        }
        let date = new Date();
        let time = '_' + date.getFullYear() + "_" + date.getMonth() + "_" + date.getDay() + "_" + date.getHours() + "_" + date.getMinutes();
        let avatarName = name + time + '.' + type;
        let newPath = form.uploadDir + "/" + avatarName;
        fs.renameSync(files.file.path, newPath);  //重命名
        let r = request.post('https://up-z2.qiniup.com', function (err, response, body) {
            if (!err) {
                fs.unlinkSync(newPath)
                let picture = 'http://plqgdover.bkt.clouddn.com' + '/' + JSON.parse(body).key
                query(addSql, [fields.name, fields.description, picture, fields.status], function (request) {
                    if (request.affectedRows == 1) {
                        res.send({code: 1, message: "success", msg: '添加成功'})
                    } else {
                        res.send({code: 0, message: "faild", msg: '添加失败'})
                    }
                })
                return
            }
            res.send({code: 0, message: "faild", msg: '图片上传失败'})
        })
        let f = r.form()
        f.append('token', token.token)
        f.append('file', fs.createReadStream(newPath))
    })
})

//删除用户
let deleteSql = 'delete from about where id = ?'
router.get('/deleteData', function (req, res, next) {
    let id = parseFloat(req.query.id)
    console.log(id)
    query(deleteSql, [id], function (request) {
        console.log(JSON.stringify(request))
        if (request.affectedRows == 1) {
            res.send({code: '1', message: '删除成功', msg: 'success'})
        } else {
            res.send({code: 0, message: 'faild', msg: 'faild'})
        }
    })
})

//更新用户
let updateSql = 'update about set name=?, description=?, picture=?, status=? where id=?'
router.post('/updateData', function (req, res, next) {
    let form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = path.join(__dirname + "/../page/upload");
    form.keepExtensions = true;//保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024;
    //处理图片
    form.parse(req, function (err, fields, files) {
        if (fields.picture == undefined || fields.picture == null) {
            let filename = files.file.name
            let nameArray = filename.split('.');
            let type = nameArray[nameArray.length - 1];
            let name = '';
            for (let i = 0; i < nameArray.length - 1; i++) {
                name = name + nameArray[i];
            }
            let date = new Date();
            let time = '_' + date.getFullYear() + "_" + date.getMonth() + "_" + date.getDay() + "_" + date.getHours() + "_" + date.getMinutes();
            let avatarName = name + time + '.' + type;
            let newPath = form.uploadDir + "/" + avatarName;
            fs.renameSync(files.file.path, newPath);  //重命名
            let r = request.post('https://up-z2.qiniup.com', function (err, response, body) {
                if (!err) {
                    fs.unlinkSync(newPath)
                    let picture = 'http://plqgdover.bkt.clouddn.com' + '/' + JSON.parse(body).key
                    query(updateSql, [fields.name, fields.description, picture, fields.status, fields.id], function (request) {
                        if (request.affectedRows == 1) {
                            res.send({code: 1, message: "success", msg: '编辑成功'})
                        } else {
                            res.send({code: 0, message: "faild", msg: '编辑失败'})
                        }
                    })
                    return
                }
                res.send({code: 0, message: "faild", msg: '图片上传失败'})
            })
            let f = r.form()
            f.append('token', token.token)
            f.append('file', fs.createReadStream(newPath))
        } else {
            query(updateSql, [fields.name, fields.description, fields.picture, fields.status, fields.id], function (request) {
                if (request.affectedRows == 1) {
                    res.send({code: 1, message: "success", msg: '编辑成功'})
                } else {
                    res.send({code: 0, message: "faild", msg: '编辑失败'})
                }
            })
        }

    })
})

module.exports = router;