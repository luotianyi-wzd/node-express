module.exports =
    {
        mysql: {
            host: 'localhost',
            user: 'root',
            password: '123456',
            database: 'mytest',
            port: 3306,
            multipleStatements: true
        },
        qiniu: {
            accessKey: '******',
            secretKey: '******',
            bucket: 'test',
            origin: 'http://test.u.qiniudn.com',
            uploadURL: 'http://up-z2.qiniu.com/'
        }
    };
