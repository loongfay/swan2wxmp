/**
 * @file 视图内容解析为ast
 * @author zhaolongfei
 */

'use strict';

const _ = require('lodash');
const {Parser, DomHandler} = require('stricter-htmlparser2');

// 虚拟根节点名称
module.exports.FakeRoot = Symbol('fake-root');

// 获取parser和handler
module.exports.getHtmlParser = function (options) {
    options = options || {
        xmlMode: false,
        lowerCaseAttributeNames: false,
        recognizeSelfClosing: true,
        lowerCaseTags: false
    };

    const handler = new DomHandler();
    const htmlParser = new Parser(handler, options);

    return {htmlParser, handler};
};

module.exports.parser = function parser(options) {
    options = options || {
        xmlMode: false,
        lowerCaseAttributeNames: false,
        recognizeSelfClosing: true,
        lowerCaseTags: false
    };

    this.Parser = parser;

    function parser(doc) {
        const {htmlParser, handler} = exports.getHtmlParser(options);

        htmlParser.end(doc);

        return {
            type: 'tag',
            name: exports.FakeRoot,
            attribs: {},
            children: _.isArray(handler.dom) ? handler.dom : [handler.dom]
        };
    }
};
