const router = require('koa-router')();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

router.prefix('/eleme');

router.post('/login', async ctx => {
    const postInfo = ctx.request.body; // 获取登录信息
    axios.post('https://h5.ele.me/restapi/eus/login/mobile_send_code', postInfo).then(res => {

    });
})

module.exports = router;