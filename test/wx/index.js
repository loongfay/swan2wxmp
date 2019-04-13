wx.navigateTo({
  url: '../logs/logs'
});
const name = 'yican';

// test api exist check in logical expression
if (wx.checkIsSupportSoterAuthentication != null && true) {
  console.log(true);
}

// test wx as function arg
Object.create(wx, {});
console.log(1, wx);

// test UnaryExpression
if (!wx.checkIsSupportSoterAuthentication) {
  console.log(true);
}
if (typeof wx.checkIsSupportSoterAuthentication !== 'function') {
  console.log(true);
}

const wx = {};
for (const key in wx) {
  console.log(`wx${key}:`, wx[key]);
}
while (wx) {
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