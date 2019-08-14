wx.navigateTo({
  url: '../logs/logs'
});

wx.navigateToMiniProgram(1);
wx.login(1);
wx.ocrIdCard(1);

const name = 'yican';

// test api exist check in logical expression
if (wx.checkIsSupportSoterAuthentication != null && true) {
  console.log(true);
}

// test wx as function arg
Object.create(swan, {});
console.log(1, swan);

// test UnaryExpression
if (!wx.checkIsSupportSoterAuthentication) {
  console.log(true);
}
if (typeof wx.checkIsSupportSoterAuthentication !== 'function') {
  console.log(true);
}

const swan = {};
for (const key in swan) {
  console.log(`wx${key}:`, wx[key]);
}
while (swan) {
  console.log(`wx${key}:`, wx[key]);
}

wx.aaa = 111;
wx['bbb'] = 222;
wx[ccc] = 333;

console.log('__route__:', currentPage.route);
console.log('__route__:', currentPage['route']);
console.log('__route__:', currentPage[route]);
console.log('__route__:', arr[arr.length - 1].route);

let data = wx.getExtConfigSync().extConfig;
data = wx.getExtConfigSync().extConfig.ext;
data = aaa[bbb].getExtConfigSync().extConfig;
data = wx.getExtConfigSync().extConfig;