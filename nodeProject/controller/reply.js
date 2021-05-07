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
router
    .post('/addReply', async (ctx, next) => {
        console.log(ctx.request.body)
        try {
            await next()
            const postData = ctx.request.body;
            postData.REPLY_CONTENT =  postData.REPLY_CONTENT.replace(/\"/g,"'");
            //插入user 表
            let result = await query('INSERT INTO qu_issue_reply(I_SID,REPLY_CONTENT,USER_SID,DEPT_NAME,VERSION,CREATED_TIME,CREATED_BY_NAME,CREATED_BY,PARENT_SID)' +
                ' VALUES ("' + postData.I_SID + '","' + postData.REPLY_CONTENT + '","' + postData.USER_SID + '","' + postData.DEPT_NAME + '","1","' + today + '","' + postData.CREATED_BY_NAME + '","' + postData.CREATED_BY + '","' + postData.PARENT_SID + '")');

            await query('UPDATE qu_issue SET COM_LENGTH =COM_LENGTH+1 where I_SID='+ postData.I_SID)

            ctx.body = {
                code: 20000,
                data: [],
                message: postData.message ? postData.message : "成功"
            };
        } catch (err) {
            console.log(err)
            ctx.body = {
                message: err.message
            };
        }
    })
    .post('/updateProblems', async (ctx, next) => {
        console.log(ctx.request.body)
        const postData = ctx.request.body;
        //插入user 表
        let result =  await query('UPDATE qu_issue ' +
            'SET ISSUE_TITEL = ?,' +
            'ISSUE_TYPE = ?,' +
            'ISSUE_STATUS =?,' +
            'DEPT_NAME=?,' +
            'ISSUE_CONTENT = ?,' +
            'UPDATED_BY_NAME = ?,' +
            'UPDATED_BY = ?,' +
            'UPDATED_TIME = ?,' +
            'VERSION=? ' +
            'where I_SID=?;',
            [postData.ISSUE_TITEL,postData.ISSUE_TYPE,postData.ISSUE_STATUS,postData.DEPT_NAME,postData.ISSUE_CONTENT,postData.UPDATED_BY_NAME,postData.
                UPDATED_BY,today,postData.VERSION+1,postData.I_SID] );
        //插入user team 关联表       ,ISSUE_CONTENT   "' + postData.ISSUE_CONTENT + '",
        // for (let i = 0; i < postData.users.length; i++) {
        //     await query('INSERT INTO qu_issue_invite(I_SID,USER_SID,VERSION,CREATED_TIME,CREATED_BY_NAME,CREATED_BY)' +
        //         ' VALUES ("' + result.insertId + '","' +  postData.users[i].USER_SID + '","1","' + today + '","'+postData.CREATED_BY_NAME+'","'+postData.CREATED_BY+'")');
        // }

        ctx.body = {
            code: 20000,
            data: result,
            message: postData.message ? postData.message : "成功"
        };
    })

    .post('/replyList', async (ctx, next) => {
        //查询列表
        ctx.type = 'Content-Type: application/json;charset=utf-8';
        const request = ctx.request.body;
        let result = await query('SELECT * FROM qu_issue_reply where I_SID ='+request.I_SID+'');

        ctx.body = {
            code: 20000,
            data: result,
            message: 'success'
        };
    })

    .post('/problemListBykey', async (ctx, next) => {
        //查询列表
        ctx.type = 'Content-Type: application/json;charset=utf-8';
        const params = ctx.request.body;
        let result = await query(params.sql);
        if(params.sqlrt){
            result[0].visitedUserList = await query(params.sqlrt);
        }
        ctx.body = {
            code: 20000,
            rspBody: result[0],
            message: 'success'
        };
    })


    .post('/deleteProblem', async (ctx, next) => {
        try {
            await next()
            const postData = ctx.request.body;
            if (!postData.id) {
                ctx.body = {
                    code: 40000,
                    message: '参数不能空'
                }
            }
            await query('DELETE FROM qu_issue where I_SID=' + postData.id);
            ctx.body = {
                code: 20000,
                data: [],
                message: '删除成功'
            };
        } catch (err) {
            console.log(err)
            ctx.body = {
                message: err.message
            };
        }
    })

module.exports = router