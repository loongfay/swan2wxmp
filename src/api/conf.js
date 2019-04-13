/**
 * @file api map
 * @author zhaolongfei
 */

module.exports = {
    api: {
        navigateToSmartProgram: {
            mapping: 'navigateToMiniProgram'
        },
        navigateBackSmartProgram: {
            mapping: 'navigateBackMiniProgram'
        },
        login: {
            msg: '登录接口存在diff \n      相关文档：https://developers.weixin.qq.com/miniprogram/dev/api/wx.login.html'
        },
        ocrIdCard: null,
        ocrBankCard: null,
        ocrDrivingLicense: null,
        ocrVehicleLicense: null,
        textReview: null,
        textToAudio: null,
        imageAudit: null,
        advancedGeneralIdentify: null,
        objectDetectIdentify: null,
        carClassify: null,
        dishClassify: null,
        logoClassify: null,
        animalClassify: null,
        plantClassify: null,
        getVoiceRecognizer: null,
        getEnvInfoSync: null,
        isLoginSync: null,
        getSwanId: null,
        verify: null,  // swanid有效性校验接口
        openShare: null,
        requestPolymerPayment: {
            mapping: 'requestPayment',
            msg: '支付接口存在diff \n      相关文档：https://developers.weixin.qq.com/miniprogram/dev/api/wx.requestPayment.html'
        },
        setMetaDescription: null,
        setMetaKeywords: null,
        setDocumentTitle: null,
        loadSubPackage: null,
        submitresource: null,
        deleteresource: null,
        submitsitemap: null,
        deletesitemap: null
    }
};
