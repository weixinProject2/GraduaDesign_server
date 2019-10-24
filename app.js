const Koa = require('koa');
const app = new Koa();
const views = require('koa-views');
const json = require('koa-json');
const onerror = require('koa-onerror');
const session = require('koa-session');
const koajwt = require('koa-jwt');
const bodyparser = require('koa-bodyparser');
const logger = require('koa-logger');
const cors = require('koa-cors');

const index = require('./routes/index');
const users = require('./routes/users');
// error handler
onerror(app);
// cors
app.use(cors({
  origin:function (ctx) {
    if(ctx.url === '/string'){
      return "*";
    }
    return '*';
  },
  exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
  maxAge: 5,
  credentials: true,
  allowMethods: ['GET', 'POST', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));
// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json());
app.use(logger());
app.use(require('koa-static')(__dirname + '/public'));
// 设置session信息
app.key = ['secret'];
const CONFIG = {
    key: 'koa:sess',
    maxAge: 86400000,
    overwrite: true,
    httpOnly: true,
    signed: true,
    rolling: false,
    renew: false,
}
app.use(session(CONFIG, app));

app.use(views(__dirname + '/views', {
  extension: 'pug'
}));

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
});

app.use(async (ctx, next) => {
  return next().catch((err) => {
    if (err.status === 401) {
      ctx.status = 401;
      ctx.body = {
        code: '-200-',
        desc: '登录过期，请重新登录'
      };
    }
  })
})

// routes
app.use(index.routes(), index.allowedMethods());
app.use(users.routes(), users.allowedMethods());
// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
