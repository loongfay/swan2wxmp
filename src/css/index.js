/**
 * @file wxss convert css
 * @author zhaolongfei
 */

const glob = require('glob');
const utils = require('../lib/utils');
const chalk = require('chalk');
const path = require('path');

exports.transform = function* transform(form) {

    const files = yield new Promise(resolve => {
        let filePath = form.dist;

        const ext = 'wxss';
        // 添加支持单一文件入口逻辑
        if (utils.isDirectory(filePath)) {
            filePath = filePath + '/**/*.' + ext;
        }

        const extname = path.extname(filePath);
        if (extname === '.' + ext) {
            glob(filePath, function (err, files) {
                resolve(err ? [] : files);
            });
        } else {
            resolve([]);
        }
    });

    let content;

    for (let i = 0; i < files.length; i++) {
        content = yield utils.getContent(files[i]);
        yield utils.saveFile(files[i], content);
    }

    console.log(chalk.cyan('👉    Successfully transform wxss file'));
};
