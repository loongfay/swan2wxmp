/**
 * @file wxml convert swan
 * @author zhaolongfei
 */

const glob = require('glob');
const babylon = require('babylon');
const traverse = require('babel-traverse').default;
const generate = require('babel-generator').default;
const utils = require('../lib/utils');
const chalk = require('chalk');
const T = require('babel-types');
const path = require('path');

const api = require('./conf').api;

let flag = false;
exports.transformContent = function transformViewContent(content, api, beforeCtx, afterCtx, file) {
    const ast = babylon.parse(content, {
        sourceType: 'module',
        plugins: '*'
    });


    // 转换api接口
    traverse(ast, {
        // Identifier(path) {
        //     if (path.node.name === beforeCtx) {
        //         path.node.name = afterCtx;
        //     }
        // },
        MemberExpression(path) {
            if (path.node.object.name === beforeCtx) {
                path.node.object.name = afterCtx;
            }
            const prop = path.node.property.name;
            if (api[prop] === null) {
                console.log(chalk.red(`api:${prop} 在微信环境下不支持！`));
            } else if (api[prop]) {
                if (api[prop].msg) {
                    console.log(chalk.yellow(api[prop].msg));
                } else if (api[prop].mapping) {
                    path.node.property.name = api[prop].mapping;
                }
            }
        }
    });

    const generateResult = generate(ast, {});

    return generateResult.code;
};

exports.transform = function* transform(context) {
    // 过滤js文件
    const files = yield new Promise(resolve => {
        let filePath = context.dist;
        // 添加支持单一文件入口逻辑
        if (utils.isDirectory(filePath)) {
            filePath = filePath + '/**/*.js';
        }

        const extname = path.extname(filePath);

        if (extname === '.js') {
            glob(filePath, {ignore: '**/node_modules/**/*.js'}, function (err, res) {
                resolve(err ? [] : res);
            });
        } else {
            resolve([]);
        }
    });

    let content;

    // 遍历文件进行转换
    for (let i = 0; i < files.length; i++) {
        content = yield utils.getContent(files[i]);
        const code = exports.transformContent(content, api, 'swan', 'wx', files[i]);
        yield utils.saveFile(files[i], code);
    }

    console.log(chalk.cyan('👉    Successfully transform js file'));
};