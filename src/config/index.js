/**
 * @file transform json
 * @author hiby
 */

'use strict';

const _ = require('lodash');
const glob = require('glob');
const chalk = require('chalk');
const detectIntent = require('detect-indent');

const utils = require('../lib/utils');
const path = require('path');


/**
 * 转换一个JSON文件
 *
 * @param {string} path 文件路径
 * @param {string} contents 文件内容
 * @return {Promise.<VFile>}
 */
module.exports.transform = function (path, contents) {
    const vfile = utils.toVFile(path, contents);
    const indent = detectIntent(contents).indent || '  ';
    let json = {};
    try {
        json = JSON.parse(contents);
    }
    catch (err) {
        vfile.message('Invalid config file');
    }

    // 处理自定义组件log
    componentLog(json, path);

    let isComponentNameTransformed = false;
    const componentRenameMap = {};
    if (json.usingComponents) {
        // 为了保留原始的usingComponents中组件定义顺序
        const newUsingComponents = {};
        Object.keys(json.usingComponents).forEach(
            name => {
                if (/[A-Z_]/.test(name)) {
                    isComponentNameTransformed = true;

                    const newName = _.kebabCase(name);
                    componentRenameMap[name] = newName;
                    newUsingComponents[newName] = json.usingComponents[name];
                }
                else {
                    newUsingComponents[name] = json.usingComponents[name];
                }
            }
        );
        json.usingComponents = newUsingComponents;
    }

    if (isComponentNameTransformed) {
        vfile.data.isComponentNameTransformed = true;
        vfile.data.componentRenameMap = componentRenameMap;
        vfile.contents = JSON.stringify(json, null, indent);
    }
    return Promise.resolve(vfile);
};

/**
 * 转换配置
 *
 * @param {Object} context 转换上下文
 */
module.exports.transformConfig = function* transformConfig(context) {
    const files = yield new Promise(resolve => {
        let filePath = context.dist;
        // 添加支持单一文件入口逻辑
        if (utils.isDirectory(filePath)) {
            filePath = filePath + '/**/*.json';
        }
        const extname = path.extname(filePath);
        if (extname === '.json') {
            glob(filePath, function (err, res) {
                resolve(err ? [] : res);
            });
        } else {
            resolve([]);
        }
    });
    for (let i = 0; i < files.length; i++) {
        const content = yield utils.getContent(files[i]);
        const result = yield exports.transform(files[i], content);
        yield utils.saveFile(files[i], String(result));

        // 把重命名信息放到全局context上
        const {isComponentNameTransformed, componentRenameMap} = result.data;
        if (isComponentNameTransformed) {
            context.data.renamedComponents = {
                ...(context.data.renamedComponents || {}),
                [files[i]]: componentRenameMap
            };
        }
    }
    console.log(chalk.cyan('👉    Successfully transform config file'));
};
