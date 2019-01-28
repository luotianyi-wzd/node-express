var mysql = require('mysql')
var conf = require('./../conf/index')

// 使用连接池，提升性能
var pool = mysql.createPool(conf.mysql)

var query = function(sql, params, callback) {
    pool.getConnection(function (err, connection) {
        connection.query(sql, params, function (err, request) {
            if (err) {
                console.log('error', err.message)
                return
            }
            callback(request, err)
        })
        connection.release();

    })
}
module.exports = query