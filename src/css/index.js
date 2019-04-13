/**
 * @file wxss convert css
 * @author yican
 */

const glob = require('glob');
const utils = require('../lib/utils');
const chalk = require('chalk');
const path = require('path');

// function transformCssContent(content) {
//     // 无请求头的css静态资源url添加https请求头
//     content = utils.transformCssStaticUrl(content);
//     return content.replace(/\.wxss/ig, '.css');
// };

exports.transform = function* transform(form) {
    // console.log('transform css:' + JSON.stringify(form))

    const files = yield new Promise(resolve => {
        let filePath = form.dist;
        // console.log('in css===========>0' + filePath)

        const ext = 'wxss';
        // 添加支持单一文件入口逻辑
        if (utils.isDirectory(filePath)) {
            filePath = filePath + '/**/*.' + ext;
        }

        // console.log('in css===========>1' + filePath)

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
        // console.log('in css===========>' + files[i])

        content = yield utils.getContent(files[i]);
        // content = transformCssContent(content);
        yield utils.saveFile(files[i], content);
    }

    console.log(chalk.cyan('👉    Successfully transform wxss file'));
};
