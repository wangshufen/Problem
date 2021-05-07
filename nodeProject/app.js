
const Koa = require('koa');
const static = require('koa-static');
const Router = require('koa-router');
const { join } = require('path');
const { query } = require('./server/db');
const koaBody = require('koa-body');//koa-body 支持文件、json、form格式的请求体
const bodyParser = require('koa-bodyparser')
const jwt = require('koa-jwt')
const link = require('./server/setDomain');
const path = require('path')
const {verToken } = require('./utils/tokenVerify');
const app = new Koa();
const cors = require('koa2-cors')
app.use(cors())
const router = new Router();


app.use(static(
    join(__dirname,'public')
));
app.use(koaBody({
    // 支持文件格式
    multipart: true,

    formidable: {
        // // 上传目录
      //   uploadDir: path.join(__dirname, 'public/uploads'),
        uploadDir: `${link.domainLink.uploadDisk}`,
        // // 保留文件扩展名
        keepExtensions: true,
    },
    onFileBegin:(name,file) => {
        //获取文件后缀
        const ext = getUploadFileExt(file.name);
        // 最终要保存到的文件夹目录
        const dirName = getUploadDirName();
        const dir = path.join(__dirname, `public/uploads/${dirName}`);
        // 检查文件夹是否存在如果不存在则新建文件夹
        checkDirExist(dir);
        // 获取文件名称
        const fileName = file.name;
        // 重新覆盖 file.path 属性
        file.path = `${dir}/${fileName}`;
        app.context.uploadpath = app.context.uploadpath ? app.context.uploadpath : {};
        app.context.uploadpath[name] = `${dirName}/${fileName}`;


    },
    onError:(err)=>{
        console.log(err);
    }
}));
app.use(bodyParser({

    }
))
const  list = require('./controller/list.js');
const  base = require('./controller/baseData.js');
const  problem = require('./controller/problem.js');
const  reply = require('./controller/reply.js');
router.use('/problem-api/getlist',list.routes())
router.use('/problem-api/base',base.routes())
router.use('/problem-api/problem',problem.routes())
router.use('/problem-api/reply',reply.routes())
app.use(router.routes()).use(router.allowedMethods());
//解析token
const secret = 'my_secret';


/* 当token验证异常时候的处理，如token过期、token错误 */
app.use((ctx, next) => {
    //console.log(ctx)
    return next().catch((err) => {
        // console.log(err)
        // console.log(err.status)
        if (err.status === 401) {
            ctx.status = 401;
            ctx.body = {
                ok: false,
                msg:'登陆过期'
            }
        } else {
            throw err;
        }

    });

});

app.use(
    jwt({
        secret: secret
    }).unless({
         //path: [/^\/login/, /^\/register/, /^\/uploadfile/]
        path: ['/uploadfile',/^\/login/]
    })

);



app.listen(3000);
console.log('listen at 3000');


