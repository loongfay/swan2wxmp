swan.navigateTo({
    url: '../logs/logs'
});

swan.navigateToSmartProgram();
swan.login();
swan.ocrIdCard();

const name = 'yican';

// test api exist check in logical expression
if (swan.checkIsSupportSoterAuthentication != null && true) {
    console.log(true);
}

// test wx as function arg
Object.create(swan, {});
console.log(1, swan);

// test UnaryExpression
if (!swan.checkIsSupportSoterAuthentication) {
    console.log(true);
}
if (typeof swan.checkIsSupportSoterAuthentication !== 'function') {
    console.log(true);
}

const swan = {};
for (const key in swan) {
    console.log(`wx${key}:`, swan[key]);
}
while (swan) {
    console.log(`wx${key}:`, swan[key]);
}

swan.aaa = 111;
swan['bbb'] = 222;
swan[ccc] = 333;

console.log('__route__:', currentPage.route);
console.log('__route__:', currentPage['route']);
console.log('__route__:', currentPage[route]);
console.log('__route__:', arr[arr.length - 1].route);

let data = swan.getExtConfigSync().extConfig;
data = swan.getExtConfigSync().extConfig.ext;
data = aaa[bbb].getExtConfigSync().extConfig;
data = swan.getExtConfigSync().extConfig;
