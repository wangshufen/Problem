const Router = require('koa-router')
const { join } = require('path');
const { query } = require('../server/db');
const { setToken,verToken } = require('../utils/tokenVerify');
// const mysql = require('mysql')
// const jsonwebtoken = require('jsonwebtoken')
const link = require('../server/setDomain');
const jwt = require('koa-jwt')
const path = require('path')
const router = new Router()
//登录
router.post('/login', async (ctx, next) => {
        //查询列表
        console.log(ctx.request.body)

        ctx.type = 'Content-Type: application/json;charset=utf-8';
        const sql = ctx.request.body, user = {username: ctx.USER_NAME, password: ctx.PASSWORD}

        let result = await query(sql);
    console.log(result);
    if (result.length <= 0) {
            ctx.body = {
                retCode: 50000,
                code: 20000,
                message: '账号不存在'
            };
        } else {
            if (result[0].PASSWORD != sql.password) {
                ctx.body = {
                    code: 20000,
                    retCode: 50000,
                    message: '密码错误'
                }
            } else {
                setToken(user.username, user.password).then((data) => {
                    ctx.body = {
                        code: 20000,
                        retCode: 20000,
                        data: {token: data, reuslt: result},

                        message: '登陆成功'
                    };
                })
            }
        }
        //  await next();

    });
router.post('/user/logout', async (ctx, next) => {
    //查询列表
    ctx.body = {
        code: 20000,
        data: 'success'
    };

});


router.post('/getUserList', async (ctx, next) => {
    //查询列表fsetToken
    // console.log(ctx.request.body)
    ctx.type = 'Content-Type: application/json;charset=utf-8';
    const sql = ctx.request.body;

        // const sqlStr = 'select a.*,GROUP_CONCAT(c.PROJECT_NAME) teamNames,GROUP_CONCAT(e.DEPT_NAME) deptNames from base_user a ' +
        //     'left join qu_team_user b ' +
        //     'on a.USER_SID = b.USER_SID ' +
        //     'left join base_team c ' +
        //     'on  b.P_SID = c.P_SID ' +
        //     'left join qu_dept_user d ' +
        //     'on  a.USER_SID = d.USER_SID ' +
        //     'left join base_department e ' +
        //     'on  d.DEPT_SID = e.DEPT_SID ' +
        //     'where 1=1 ' +
        //     'group by a.USER_SID'
    const sqlStr = "select h1.*,h2.deptNames from (select a.*,GROUP_CONCAT(c.PROJECT_NAME) teamNames from base_user a left join qu_team_user b on a.USER_SID = b.USER_SID " +
        "left join base_team c on  b.P_SID = c.P_SID where 1=1  group by a.USER_SID ) h1 left join (select a.* ,GROUP_CONCAT(e.DEPT_NAME) deptNames from base_user a " +
        "left join qu_dept_user d on  a.USER_SID = d.USER_SID left join base_department e on  d.DEPT_SID = e.DEPT_SID where 1=1 group by a.USER_SID ) h2 on h1.user_sid = h2.user_sid "

    let result = await query(sqlStr);
    console.log(result);
    ctx.body = {
        code: 20000,
        data: result,
        message: 'getList success'
    };
});
//
router
    .post('/addUser', async (ctx, next) => {
   //     console.log(ctx.request.body)
        const postData = ctx.request.body;
        //插入user 表
        let result = await query('INSERT INTO base_user(USER_NAME,USER_ACCOUNT,USER_PHONE,PASSWORD,DEPT_NAME,USER_TEAM,USER_TYPE,VERSION)' +
            ' VALUES ("' + postData.USER_NAME + '","' + postData.USER_ACCOUNT + '","' + postData.USER_PHONE + '","' + postData.PASSWORD + '","' + postData.DEPT_NAME + '","' + postData.USER_TEAM + '","' + postData.USER_TYPE + '","1")');

        //插入user team 关联表
        if(postData.TEAMS.length>0){
            for (let i = 0; i < postData.TEAMS.length; i++) {
                await query('INSERT INTO qu_team_user(USER_SID,P_SID,VERSION)' +
                    ' VALUES ("' + result.insertId + '","' +  postData.TEAMS[i] + '","1")');
            }
        }
        //插入qu_dept_user关联表
        if(postData.DETPS.length>0){
            for (let i = 0; i < postData.DETPS.length; i++) {
                await query('INSERT INTO qu_dept_user(USER_SID,DEPT_SID,VERSION)' +
                    ' VALUES ("' + result.insertId + '","' +  postData.DETPS[i] + '","1")');
            }
        }
        ctx.body = {
            code: 20000,
            data: [],
            message: postData.message ? postData.message : "成功"
        };
    })
    .post('/deleteUser', async (ctx, next) => {
        console.log(ctx.request.body)
        const postData = ctx.request.body;
//    ctx.type = 'Content-Type: application/json;charset=utf-
        if(!postData.id){
            ctx.body = {
                code: 40000,
                message: '参数不能空'
            }
        }
        await query('DELETE FROM base_user where USER_SID=' + postData.id);
        ctx.body = {
            code: 20000,
            data: [],
            message: '新增成功'
        };
    })

    .post('/updateUser', async (ctx, next) => {
        console.log(ctx.request.body)
        const postData = ctx.request.body;

        if(!postData.id){
            ctx.body = {
                code: 40000,
                message: '参数不能空'
            }
        }
        await query('UPDATE base_user ' +
            'SET USER_NAME = ?,' +
            'USER_ACCOUNT = ?,' +
            'USER_PHONE =?,' +
            'PASSWORD=?,' +
            'DEPT_NAME = ?,' +
            'USER_TEAM = ?,' +
            'USER_TYPE = ?,' +
            'VERSION=? ' +
            'where USER_SID=?;',[postData.USER_NAME,postData.USER_ACCOUNT,postData.USER_PHONE,postData.PASSWORD,postData.DEPT_NAME,postData.USER_TEAM,postData.USER_TYPE,postData.VERSION+1,postData.USER_SID] );
        if(postData.TEAMS.length>0){
            //修改人员和team关联表，先删除之前的关联项目组 再重新插入
            await query('DELETE FROM qu_team_user where USER_SID=' + postData.USER_SID)
            //插入user team 关联表
            if(postData.TEAMS.length>0){
                for (let i = 0; i < postData.TEAMS.length; i++) {
                    await query('INSERT INTO qu_team_user(USER_SID,P_SID,VERSION)' +
                        ' VALUES ("' +  postData.USER_SID + '","' +  postData.TEAMS[i] + '","1")');
                }
            }
        }
        if(postData.TEAMS.length>0){
            //插入qu_dept_user关联表
            //修改人员和team关联表，先删除之前的关联项目组 再重新插入
            await query('DELETE FROM qu_dept_user where USER_SID=' + postData.USER_SID)
            if(postData.DETPS.length>0){
                for (let i = 0; i < postData.DETPS.length; i++) {
                    await query('INSERT INTO qu_dept_user(USER_SID,DEPT_SID,VERSION)' +
                        ' VALUES ("' +postData.USER_SID+ '","' +  postData.DETPS[i] + '","1")');
                }
            }
        }

        ctx.body = {
            code: 20000,
            data: [],
            message: '修改成功'
        };
    })
//
    router.post('/getUserDetail', async (ctx, next) => {
        //查询项目组下的人

        ctx.type = 'Content-Type: application/json;charset=utf-8';
        const sqlList = ctx.request.body;
        console.log(sqlList);
        let Teamresult = await query(sqlList.sql);
        console.log(Teamresult);
        let Deptresult = []
        if(sqlList.sql1){
             Deptresult = await query(sqlList.sql1);
        }

        ctx.body = {
            code: 20000,
                rspBody: {"teamresult":Teamresult,"deptresult":Deptresult},
            message: 'getList success'
        };
    });

    router.post('/uploadfile', async (ctx, next) => {
        // 上传单个文件

        const file = ctx.request.files.file; // 获取上传文件
        console.log(file);

        let ext = file.name.split('.');

        const basename = path.basename(file.path)
        console.log(link.domainLink.fileUrl);
      //  return ctx.body = {path: `${ctx.origin}/uploads/${basename}`}

        return ctx.body = {path: `${link.domainLink.fileUrl}/${basename}`}
    });

module.exports = router