const Router = require('koa-router')
const { join } = require('path');
const { query } = require('../server/db');
const mysql = require('mysql')
const jsonwebtoken = require('jsonwebtoken')
const jwt = require('koa-jwt')
const {postRouter}= require('../utils/tokenVerify')
const date = require("silly-datetime")
const router = new Router()

const today = date.format(new Date(),'YYYY-MM-DD HH:ss:mm');

router.post('/islogin',async (ctx,next) => {
    // console.log(ctx);
    try {
        await next()
        //console.log(ctx.response.status);
        if(ctx.response.status != 401){
            const parts = ctx.header.authorization.split(' ')
            const request = ctx.request.body;
            if (parts && request.token) {
                if(parts[1] == request.token){
                    ctx.body = {
                        code: 20000,
                        retCode:'0000000',
                        rspBody: {},
                        message: 'success'
                    };
                }
            }
        } else {
            ctx.body = {
                code: 20000,
                retCode:'2000000',
                rspBody: {},
                message: "未登录或登录过期"
            };
        }
    } catch (err) {
        console.log(err)

        ctx.body = {
            message:"未登录或无权限"|| err.message
        };
    }
})
router.post('/deptmentList', async (ctx, next) => {
    //查询列表
    ctx.type = 'Content-Type: application/json;charset=utf-8';
    const sql = ctx.request.body;
    let result = await query('SELECT * FROM base_department');

    ctx.body = {
        code: 20000,
        rspBody: {"resultData":result},
        message: 'success'
    };
});
//
router.post('/addDeptment', async (ctx, next) => {
    console.log(ctx.request.body)
    const postData = ctx.request.body;
    await query('INSERT INTO base_department(DEPT_NAME,DEPT_DESC,VERSION,CREATED_TIME,CREATED_BY_NAME,CREATED_BY)' +
        ' VALUES ("' + postData.DEPT_NAME + '","' + postData.DEPT_DESC + '",1,"' + today + '","'+postData.CREATED_BY_NAME+'","'+postData.CREATED_BY+'")');
    ctx.body = {
        code: 20000,
        data: [],
        message: postData.message ? postData.message : "成功"
    };
})
    .post('/deleteDeptment', async (ctx, next) => {
        const postData = ctx.request.body;
//    ctx.type = 'Content-Type: application/json;charset=utf-
        if (!postData.id) {
            ctx.body = {
                code: 40000,
                message: '参数不能空'
            }
        }
        await query('DELETE FROM base_department where DEPT_SID=' + postData.id);
        ctx.body = {
            code: 20000,
            data: [],
            message: '新增成功'
        };
    })

    .post('/updateDeptment', async (ctx, next) => {
        try {
            await next()
            const postData = ctx.request.body;
            if (!postData.DEPT_SID) {
                ctx.body = {
                    code: 40000,
                    message: '参数不能空'
                }
            }
            await query('UPDATE base_department ' +
                'SET DEPT_NAME = ?,' +
                'DEPT_DESC = ?,' +
                'UPDATED_TIME = ?,' +
                'VERSION=? ' +
                'where DEPT_SID=?;', [postData.DEPT_NAME, postData.DEPT_DESC, today,postData.VERSION + 1, postData.DEPT_SID]);
            ctx.body = {
                code: 20000,
                data: [],
                message: '修改成功'
            };

        } catch (err) {
            console.log(err)
            ctx.body = {
                message: err.message
            };
        }


    })

//////////////////项目组 接口
router.post('/teamList', async (ctx, next) => {
    //查询列表
    ctx.type = 'Content-Type: application/json;charset=utf-8';
    const sql = ctx.request.body;
    let result = await query(sql);

    ctx.body = {
        code: 20000,
        rspBody: {"resultData":result},
        message: 'success'
    };
});
//
router.post('/addteam', async (ctx, next) => {
    console.log(ctx.request.body)
    const postData = ctx.request.body;
    await query('INSERT INTO base_team(PROJECT_NAME,PROJECT_CODE,PROJECT_DESC,VERSION,CREATED_TIME,CREATED_BY_NAME,CREATED_BY)' +
        ' VALUES ("' + postData.PROJECT_NAME + '","' + postData.PROJECT_CODE + '","' + postData.PROJECT_DESC + '",1,"' + today + '","'+postData.CREATED_BY_NAME+'","'+postData.CREATED_BY+'")');
    ctx.body = {
        code: 20000,
        data: [],
        message: postData.message ? postData.message : "成功"
    };
})
    .post('/deleteteam', async (ctx, next) => {
        const postData = ctx.request.body;

        if (!postData.id) {
            ctx.body = {
                code: 40000,
                message: '参数不能空'
            }
        }
        await query('DELETE FROM base_team where P_SID=' + postData.id);
        ctx.body = {
            code: 20000,
            data: [],
            message: '新增成功'
        };
    })

    .post('/updateteam', async (ctx, next) => {
        try {
            await next()
            const postData = ctx.request.body;
            if (!postData.P_SID) {
                ctx.body = {
                    code: 40000,
                    message: '参数不能空'
                }
            }
            await query('UPDATE base_team ' +
                'SET PROJECT_NAME = ?,' +
                'PROJECT_CODE = ?,' +
                'PROJECT_DESC = ?,' +
                'UPDATED_TIME = ?,' +
                'VERSION=? ' +
                'where P_SID=?;', [postData.PROJECT_NAME,postData.PROJECT_CODE,postData.PROJECT_DESC,today,postData.VERSION + 1, postData.P_SID]);
            ctx.body = {
                code: 20000,
                data: [],
                message: '修改成功'
            };

        } catch (err) {
            console.log(err)
            ctx.body = {
                message: err.message
            };
        }


    })
//用项目去查人 关联表
router.post('/ckeckUserByteam', async (ctx, next) => {
    //console.log(ctx.request.body)
    const postData = ctx.request.body;
    await query(postData.sql);
    ctx.body = {
        code: 20000,
        data: [],
        message: postData.message ? postData.message : "成功"
    };
})

//数据字典接口
router.post('/dictionaryList', async (ctx, next) => {
    try {
        await next()
        //查询列表
        await query('SELECT * FROM base_dictionary').then(result=>{
            "use strict";
            ctx.body = {
                code: 20000,
                data: result,
                message: 'success'
            };
        })

    }catch(err) {
        console.log(err)
        ctx.body = {
            message: err.message
        };
    }
});
module.exports = router