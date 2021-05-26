import http from '@/common/http';
import { getUUid } from '@/common/utils';
const server = require('@/common/api');

//登录令牌
export const LOGINSECRET = {
    id: 'web',
    secret: 'sKuBjFlMsUiPsKlO',
    wxAppid: 'wx4a11ae335e843db1',
    key: getUUid()
};

export const getImgCode64 = data => http.POST(server.versatile + '/verifyCode/base64', data);