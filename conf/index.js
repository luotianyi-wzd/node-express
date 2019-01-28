module.exports =
    {
        mysql: {
            host: 'localhost',
            user: 'root',
            password: '123456',
            database: 'test',
            port: 8888,
            multipleStatements: true
        },
        qiniu: {
            accessKey: '*****',
            secretKey: '*****',
            bucket: 'test',
            origin: 'http://test.u.qiniudn.com',
            uploadURL: 'http://up-z2.qiniu.com/'
        }
    };