// server/db.js
const mysql = require('mysql');
const config = require('./mysql_config');
const conn = mysql.createConnection(config.mysql);

let pool=mysql.createPool(config.mysql);

// pool.getConnection(function(err,conn){
//     if(err){
//         callback(err,null,null);
//     }else{
//         conn.query(sql,options,function(err,results,fields){
//             //释放连接
//             conn.release();
//             //事件驱动回调
//             callback(err,results,fields);
//         });
//     }
// });


// var query=function(sql,options,callback){
//     pool.getConnection(function(err,conn){
//         if(err){
//             callback(err,null,null);
//         }else{
//             conn.query(sql,options,function(err,results,fields){
//                 //释放连接
//                 conn.release();
//                 //事件驱动回调
//                 callback(err,results,fields);
//             });
//         }
//     });
// };
// conn.connect((err) => {
//     if(err){
//         throw err;
//     }
//     console.log('mysql 连接成功');
// });

let query = (sql, params) => {

    return new Promise((resolve, reject) => {
        pool.getConnection(function (err, conn) {
            if (err) {
                //callback(err, null, null);
                throw err;
            } else {
                console.log(conn.query);
                console.log('mysql 连接成功');

                conn.query(sql, params, (error, result, fields) => {
                    if (error) {
                        reject(error);
                    } else {
                        conn.release();
                      //  console.log(result);
                        resolve(result);
                    }
                })
            }
        })
    })

}
//关闭连接
//conn.end();
module.exports = { conn, query};
