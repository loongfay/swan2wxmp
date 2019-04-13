/**
 * @file wxml convert swan
 * @author yican
 */

const glob = require('glob');
const babylon = require('babylon');
const traverse = require('babel-traverse').default;
const generate = require('babel-generator').default;
const utils = require('../lib/utils');
const chalk = require('chalk');
const T = require('babel-types');
const log = require('../lib/log');
// const componentConf = require('../config/wxmp2swan/component');
const path = require('path');

const api = require('./conf').api;


exports.transformContent = function transformViewContent(content, api, beforeCtx, afterCtx, file) {
    const ast = babylon.parse(content, {
        sourceType: 'module',
        plugins: '*'
    });
    // 处理自定义组件log
    // traverse(ast, {
    //     ObjectProperty(path) {
    //         componentLog(path, file, log);
    //     },
    //     ObjectMethod(path) {
    //         componentLog(path, file, log);
    //     },
    //     MemberExpression(path) {
    //         componentLog(path, file, log);
    //     },
    //     StringLiteral(path) {
    //         componentLog(path, file, log);
    //     }
    // });
    // 转换api接口

    traverse(ast, {
        Identifier(path) {
            // console.log("Visiting--------->: " + JSON.stringify(path.node));
            if (path.node.name === beforeCtx) {
                path.node.name = afterCtx;
            }
        },
        // MemberExpression(path) {
        //     const node = path.node;
        //     const ctx = node.object.name;
        //     // const method = getNodeMethodName(node);
        //
        //     if (ctx === beforeCtx) {
        //         node.object.name = 'wx';
        //     }
        //
        // },
        // CallExpression(path) {
        //     const node = path.node;
        //     // 处理函数调用中作为参数传入的需要转换的全局变量
        //     if (node.arguments.length) {
        //         const targetCtxIndex = node.arguments.findIndex(arg => T.isIdentifier(arg, {name: beforeCtx}));
        //
        //         if (targetCtxIndex >= 0) {
        //             node.arguments[targetCtxIndex] = T.identifier(afterCtx);
        //
        //             log.logger({
        //                 type: 'transform function call arg name',
        //                 file: file && file,
        //                 line: node.loc.start.line,
        //                 column: node.loc.start.column,
        //                 before: beforeCtx,
        //                 after: afterCtx,
        //                 message: `只转换了上下文, ${beforeCtx} ==> ${afterCtx}`
        //             }, 'info');
        //         }
        //     }
        // }
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