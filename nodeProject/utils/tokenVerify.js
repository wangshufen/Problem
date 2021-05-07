const Router = require('koa-router')
const jwt = require('jsonwebtoken')
const jwt1 = require('koa-jwt')
const router = new Router()
const secret = 'my_secret';
exports.setToken = function (username,password) {
    return new Promise((resolve,reject)=>{
        "use strict";
        const token = jwt.sign({
            username:username,
            password
        },secret, { expiresIn:  '2h' });
        resolve(token)
    }).catch((err)=>{
        "use strict";
        console.log(err)
    })
}

exports.verToken = function (token) {
    return new Promise((resolve,reject)=>{

        const userInfo = jwt.verify(token.split(' ')[1],secret,secret);
        resolve(userInfo)
    }).catch((err)=>{
        console.log(err)
    })
}
//
// exports.postRouter = function (option) {
//     return new Promise((resolve, reject) => {
//         router.post(option['url'], async (ctx, next) => {
//             const postData = ctx.request.body;
//             await query(postData.sql);
//             option['body'] ? ctx.body = option['body'] : {
//                 code: 20000,
//                 data: [],
//                 message: postData.message ? postData.message : "成功"
//             }
//             resolve();
//         })
//     })
// }
exports.rTime = function (date) {
    var json_date = new Date(date).toJSON();
    return new Date(new Date(json_date) + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '')
}