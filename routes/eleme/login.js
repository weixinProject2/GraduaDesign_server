const router = require('koa-router')();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

router.prefix('/login');

router.post('/mobile_send_code', async ctx => {
    const postInfo = ctx.request.body; // 获取登录信息
    await axios.post('https://h5.ele.me/restapi/eus/login/mobile_send_code', postInfo).then(res => {
       const data = res.data;
       return ctx.body = {
           data,
       }
    });
})

module.exports = router;