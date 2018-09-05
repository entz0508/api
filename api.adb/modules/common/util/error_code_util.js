
const RES_SUCCESS = 0;
const RES_NO_ERROR = 0;
const RES_FAILED_DB = -1;
const RES_FAILED_UNKNOWN = -2;
const RES_FAILED_HTTP_REQUEST = -3;

const RES_ERROR_PARAMETER = -1000;

const RES_NO_AUTH_APP_ID = -100000;                     // 존재하지 않는 APP ID, Not Found APP ID

const RES_DUPLICATE_DEVELOPER_EMAIL = -100101;
const RES_FAILED_CREATE_DEVELOPER_ACCOUNT = -100102;

const RES_FAILED_CREATE_USER_ACCOUNT = -200000;         // 계정 생성 실패
const RES_DUPLICATE_USER_EMAIL = -200001;               // 사용중인 이메일
const RES_FAILED_ADD_ACCOUNT = -200002;                 // 계정 추가 실패
const RES_FAILED_INSERT_SIGNUP_PATH = -200007;          // 가입경로 정보 추가 실패, failed, Insert SignupInfo

const RES_FAILED_UPDATE_APP_ACCESS_TOKEN = -200009;     // App Access Token 업데이트실패, failed, Update App Access Token
const RES_NOT_MATCH_EMAIL_OR_PWD = -200010;             // 이메일과 비밀번호가 일치하지 않음, Not Match E-Mail or Password
const RES_NOT_MATCH_SIGNUP_PATH = -200011;              // 이메일의 가입경로가 다름 Not Match signup path

const RES_NOT_FOUND_ACCOUNT = -200016;                  // failed, Not found Account ID
const RES_NOT_FOUND_EMAIL = -200017;                    // 찾을수 없는 이메일, NOT FOUND EMAIL

const RES_NOT_LOGIN = -200100;                          // 로그인 되지 않음
const RES_NOT_SEQID = -201111;                          // SEQID 확인 불가

const RES_NOT_FOUND_DATA = -300000;                     // 조회내역 없음, NOT FOUND DATA
const RES_GUEST_ALREADY_CREATED_FROM_SLP_ACCOUNT = -400104; // ACCOUNT로 이미 계정을 생성 했음

var isNull = function isNull(chk_value) {
    "use strict";
    if ((typeof chk_value === "undefined") || (null === chk_value) || (undefined === chk_value) || ("" === chk_value)) {
        return true;
    } else {
        return false;
    }
};

var convertDbErrorCodeToResultCode = function (errCode) {
    if (isNull(errCode) || isNaN(errCode)) {
        return RES_FAILED_UNKNOWN;
    } else {
        return errCode;
    }

};


module.exports = {
    convertDbErrorCodeToResultCode: convertDbErrorCodeToResultCode,

    RES_SUCCESS: RES_SUCCESS,
    RES_NO_ERROR: RES_NO_ERROR,
    RES_FAILED_DB: RES_FAILED_DB,
    RES_FAILED_UNKNOWN: RES_FAILED_UNKNOWN,
    RES_ERROR_PARAMETER: RES_ERROR_PARAMETER,

    //
    RES_NO_AUTH_APP_ID: RES_NO_AUTH_APP_ID,

    //
    RES_DUPLICATE_DEVELOPER_EMAIL: RES_DUPLICATE_DEVELOPER_EMAIL,
    RES_FAILED_CREATE_DEVELOPER_ACCOUNT: RES_FAILED_CREATE_DEVELOPER_ACCOUNT,
    
    //
    RES_FAILED_CREATE_USER_ACCOUNT: RES_FAILED_CREATE_USER_ACCOUNT,
    RES_DUPLICATE_USER_EMAIL: RES_DUPLICATE_USER_EMAIL,
    RES_NOT_LOGIN: RES_NOT_LOGIN,
    RES_NOT_SEQID: RES_NOT_SEQID,

    RES_NOT_FOUND_DATA: RES_NOT_FOUND_DATA,

    RES_FAILED_ADD_ACCOUNT: RES_FAILED_ADD_ACCOUNT,
    RES_FAILED_INSERT_SIGNUP_PATH: RES_FAILED_INSERT_SIGNUP_PATH,
    RES_FAILED_UPDATE_APP_ACCESS_TOKEN: RES_FAILED_UPDATE_APP_ACCESS_TOKEN,
    RES_FAILED_NOT_MATCH_EMAIL_OR_PWD: RES_NOT_MATCH_EMAIL_OR_PWD,
    RES_FAILED_NOT_MATCH_SIGNUP_PATH: RES_NOT_MATCH_SIGNUP_PATH,

    RES_NOT_FOUND_ACCOUNT: RES_NOT_FOUND_ACCOUNT,
    RES_NOT_FOUND_EMAIL: RES_NOT_FOUND_EMAIL,
    RES_FAILED_HTTP_REQUEST: RES_FAILED_HTTP_REQUEST
    

};