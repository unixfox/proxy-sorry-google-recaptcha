"use strict";

import got from "got";
import queryString from "query-string";
import toughCookie from "tough-cookie";
import cookie from "cookie";

const apiURL = (process.env.API_URL || "https://api.anti-captcha.com");
const clientKey = (process.env.API_CLIENT_KEY || "aaaaaaa");

const antiCaptchaInstance = got.extend({
    prefixUrl: apiURL,
    resolveBodyOnly: true,
    responseType: "json",
    method: "POST"
});

export const sendTask = function () {
    return new Promise((resolve, reject) => {
        antiCaptchaInstance("createTask", {
            json: {
                "clientKey": clientKey,
                "task": {
                    "type": "NoCaptchaTaskProxyless",
                    "websiteKey": "6LfwuyUTAAAAAOAmoS0fdqijC2PbbdH4kjq62Y1b",
                    "websiteURL": "https://www.google.com/sorry/index"
                }
            }
        }).then(body => {
            resolve(body);
        });

    });
}

export const getTask = function (taskId) {
    return new Promise((resolve, reject) => {
        antiCaptchaInstance("getTaskResult", {
            json: {
                "clientKey": clientKey,
                "taskId": taskId
            }
        }).then(body => {
            resolve(body);
        });
    });
}

export const submitRecaptchaResponse = function (gRecaptchaResponse, URL) {
    return new Promise((resolve, reject) => {
        const cookieJar = new toughCookie.CookieJar();
        const queries = queryString.parseUrl(URL).query;
        got.post("https://www.google.com/sorry/index", {
            form: {
                "g-recaptcha-response": gRecaptchaResponse,
                q: queries.q,
                continue: queries.continue
            },
            referer: "https://www.google.com" + URL,
            headers: {
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36",
                "accept-language": "en,en-US;q=0.9,fr;q=0.8,en-US;q=0.7",
                "accept-encoding": "gzip, deflate, br",
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
                "Content-Type": "application/x-www-form-urlencoded"
            },
            cookieJar,
            methodRewriting: false
        }).then(() => {
            const cookiesStringRedirectedWebsite = cookieJar.getCookieStringSync("https://" + Object.entries(cookieJar.store.idx)[0][0], { allPaths: true });
            resolve(cookie.parse(cookiesStringRedirectedWebsite)["GOOGLE_ABUSE_EXEMPTION"]);
        }).catch((error) => {
            console.log("Error while submiting the challenge. g-recaptcha-response incorrect?");
            throw (error);
        });

    });
}