
const path = require('path');
const fs = require('fs');

exports.getUploadDirName = function (){
    const date = new Date();
    let month = Number.parseInt(date.getMonth()) + 1;
    month = month.toString().length > 1 ? month : `0${month}`;
    const dir = `${date.getFullYear()}${month}${date.getDate()}`;
    return dir;
}


/**
 * @description 判断文件夹是否存在 如果不存在则创建文件夹
 */

exports.checkDirExist =function (p) {
    if (!fs.existsSync(p)) {
        fs.mkdirSync(p);
    }
}
/*
* 获取原始文件路径
* */
exports.getUploadFileExt = function (name) {
    let ext = name.split('.');
    return ext[ext.length - 1];
}

exports.getUploadFileName = function (name) {
    let ext = name.split('.');
    console.log(name);
    return ext[ext.length - 1];
}

