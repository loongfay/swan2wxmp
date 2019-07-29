/**
 * @file wxml to swan转换插件
 * @author zhaolongfei
 */

'use strict';

const _ = require('lodash');
const path = require('path');
const regexgen = require('regexgen');
// const transformBindDataConifg = require('../../../transform-bind-data-conifg');
const utils = require('../../lib/utils');

module.exports = function swan2wxml(options = {}) {
    return transform;

    function transform(tree, file) {
        transformTree(tree, file);
    }

    function transformTree(tree, file) {
        if (_.isArray(tree)) {
            return tree.map(node => transformTree(node, file));
        }

        if (tree.type === 'tag') {
            const {name, attribs, children} = tree;

            if (name === 'import' || name === 'include') {
                tree = transformImport(tree, file, options);
            }

            // template data属性的值需要减一层花括号
            if (name === 'template' && attribs.data) {
                tree = transformTemplate(tree, file, options);
            }

            // input标签强制自闭合
            if (name === 'input') {
                tree = transformInput(tree, file, options);
            }

            // tree = transformBindData(tree, file, options);

            // tree = transformOnEventBind(tree, file, options);

            tree = transformComponent(tree, file, options);

            tree.children = children.map(node => transformTree(node, file));

            tree = transformDirective(tree, file, options);

            tree = transformStyle(tree, file, options);

            // 一定要在transform children和transformDirective之后
            // const transformedAttribs = tree.attribs;
            // if (transformedAttribs['s-for'] && transformedAttribs['s-if']) {
            //     tree = transformForIFDirective(tree, file, options);
            // }
        }

        return tree;
    }
};

/**
 * 转换import和include标签
 *
 * @param {Object} node 节点对象
 * @param {VFile} file 虚拟文件
 * @param {Object} options 转换配置
 * @return {Object}
 */
function transformImport(node, file, options) {
    const attribs = node.attribs;

    if (attribs && attribs.src) {
        let src = attribs.src.replace(/\.swan$/i, '.wxml');
        // src中没有扩展名的添加默认扩展名.wxml
        if (!/\w+\.\w+$/.test(src)) {
            src = src + '.wxml';
        }
        return {
            ...node,
            attribs: {
                ...attribs,
                src: src
            }
        };
    }

    return node;
}

/**
 * 转换模板标签
 *
 * @param {Object} node 节点对象
 * @param {VFile} file 虚拟文件
 * @param {Object} options 转换配置
 * @return {Object}
 */
function transformTemplate(node, file, options) {
    const attribs = node.attribs;

    if (attribs && attribs.data) {
        return {
            ...node,
            attribs: {
                ...attribs,
                data: attribs.data.slice(1, -1)
            }
        };
    }

    return node;
}

/**
 * 转换input标签
 *
 * @param {Object} node 节点对象
 * @param {VFile} file 虚拟文件
 * @param {Object} options 转换配置
 * @return {Object}
 */
function transformInput(node, file, options) {
    if (!node.selfclose) {
        file.message('remove input close tag');
        return {
            ...node,
            selfclose: true
        };
    }
    return node;
}

/**
 * 转换自定义组件
 *
 * @param {Object} node 节点对象
 * @param {VFile} file 虚拟文件
 * @param {Object} options 转换配置
 * @return {Object}
 */
function transformComponent(node, file, options) {
    const filePath = path.resolve(file.cwd, file.dirname, file.basename);
    const swanToRenamedComponents = options.context.data.swanToRenamedComponents || {};
    const renamedComponentMap = swanToRenamedComponents[filePath];
    if (renamedComponentMap && renamedComponentMap[node.name]) {
        // @TODO: 添加warning日志
        return {
            ...node,
            name: renamedComponentMap[node.name]
        };
    }
    return node;
}

/**
 * 转换标签上的directive
 *
 * @param {Object} node 节点对象
 * @param {VFile} file 虚拟文件
 * @param {Object} options 转换配置
 * @return {Object}
 */
function transformDirective(node, file, options) {
    const {attribs, singleQuoteAttribs = {}} = node;

    if (!attribs) {
        return node;
    }

    const newAttribs = Object
        .keys(attribs)
        .reduce(
            (newAttribs, key) => {
                // 删除空wx:前缀
                let newKey = key.replace(/^s-/, 'wx:');
                // newKey = key === 'wx:for-items' ? 's-for' : newKey;
                const value = attribs[key];
                let newValue = transformBindData(value);

                // 增加花括号
                if (['s-for', 's-if', 's-elif'].includes(key) && !hasBrackets(value)) {
                    newValue = addBrackets(value);
                }

                if (key === 's-for' && value.includes(' in ')) {
                    const forValues = value.split(' in ');

                    const forKV = forValues[0].trim();
                    const forObj = forValues[1].trim();

                    const item = forKV.split(',')[0].trim();
                    const index = forKV.split(',')[1].trim();

                    newAttribs['wx:for-item'] = item;
                    newAttribs['wx:for-index'] = index;

                    newValue = addBrackets(forObj);
                }

                newAttribs[newKey] = newValue;

                return newAttribs;
            },
            {}
        );

    const newSingleQuoteAttribs = Object
        .keys(singleQuoteAttribs)
        .reduce(
            (prev, key) => {
                const newKey = key.replace(/^s-/, 'wx:');
                return {
                    ...prev,
                    [newKey]: singleQuoteAttribs[key]
                };
            },
            {}
        );

    return {
        ...node,
        attribs: newAttribs,
        singleQuoteAttribs: newSingleQuoteAttribs
    };
}

/**
 * 转换数据绑定为双向绑定语法
 *
 * @param {String} value 属性值
 */
function transformBindData(value) {
    let newValue = value;

    if (hasBracketEqs(value)) {
        newValue = `{{${dropBracketEqs(value)}}}`;
    }

    return newValue;
}

/**
 * 转换标签上的for if directive
 *
 * @param {Object} node 节点对象
 * @param {VFile} file 虚拟文件
 * @param {Object} options 转换配置
 * @return {Object}
 */
function transformForIFDirective(node, file, options) {
    const {attribs, children} = node;
    const ifValue = attribs['s-if'];
    const forValue = attribs['s-for'];
    const [forItemName, forIndexName] = forValue.slice(0, forValue.indexOf(' in ')).split(',');

    const forItemNameRegex = getVariableRegex(forItemName);
    const forIndexNameRegex = getVariableRegex(forIndexName);

    const shouldBeAfterFor = forItemNameRegex.test(ifValue) || forIndexNameRegex.test(ifValue);

    if (shouldBeAfterFor) {
        const blockNode = {
            type: 'tag',
            name: 'block',
            attribs: {
                's-if': ifValue
            },
            children: children,
            parent: node
        };

        delete node.attribs['s-if'];

        node.children = [blockNode];

        blockNode.children = blockNode.children.map(item => ({
            ...item,
            parent: blockNode
        }));
    }

    return node;
}

function hasBrackets(value = '') {
    return /^{{.*}}$/.test(value.trim());

}

function addBrackets(value = '') {
    return `{{${value.trim()}}}`;
}

/**
 * 丢掉属性值两侧的花等括号
 *
 * @param {string} value 属性值
 * @return {string}
 */
function dropBracketEqs(value = '') {
    const trimed = value.trim();
    if (/^{=.*=}$/.test(trimed)) {
        return trimed.slice(2, -2);
    }
    return value;
}

/**
 * 判断是否{{}}数据绑定
 *
 * @param {string} value 属性值
 * @return {boolean}
 */
function hasBracketEqs(value = '') {
    return /^{=.*=}$/.test(value.trim());
}

/**
 * 生成匹配变量名的正则表达式
 *
 * @param {string} variable 变量名
 * @return {RegExp}
 */
function getVariableRegex(variable) {
    if (variable[0] === '$') {
        const regex = regexgen([variable.slice(1)]);
        return new RegExp(`\\$${regex.toString().slice(1, -1)}\\b`);
    }
    const regex = regexgen([variable]);
    const res = new RegExp(`\\b${regex.toString().slice(1, -1)}\\b`);
    return res;
}

/**
 * 将使用on进行的数据绑定转换为bind进行数据绑定
 * 如: ontap -> bindtap
 *
 * @param {Object} node 节点对象
 * @param {VFile} file 虚拟文件
 * @param {Object} options 转换配置
 * @return {Object}
 */
function transformOnEventBind(node, file, options) {
    const attribs = node.attribs;

    Object.keys(attribs).forEach(attr => {
        const value = attribs[attr];
        const matchList = attr.match(/^on(\w+)/);

        if (matchList) {
            const fnName = matchList[1] || '';
            node.attribs[`bind${fnName}`] = value;
            delete node.attribs[attr];
        }
    });

    return node;
}

/**
 * 转换style
 * 无请求头的css静态资源url添加https请求头
 *
 * @param {Object} node 节点对象
 * @param {VFile} file 虚拟文件
 * @param {Object} options 转换配置
 * @return {Object}
 */
function transformStyle(node, file, options) {
    const attribs = node.attribs;

    if (attribs.style) {
        // 无请求头的css静态资源url添加https请求头
        attribs.style = utils.transformCssStaticUrl(attribs.style);
    }

    return node;
}
