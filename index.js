"use strict";

import Proxy from "http-mitm-proxy";
import * as antiCaptcha from "./anticaptcha.js";
import { promises as fsPromises } from "fs";
import fs from "fs";
import got from "got";
import delay from 'delay';

const sslCAPath = (process.env.CA_PATH || process.cwd() + 'ca');
const databaseFilePath = (process.env.DB_PATH || "./db.json");
const port = (process.env.PORT || 8081);
const proxy = Proxy();

let database = {};
if (fs.existsSync(databaseFilePath)) {
    fsPromises.readFile(databaseFilePath).then(body => {
        database = JSON.parse(body);
    });
}

const googleHosts = /(^www\.google\.[a-z]+$)|(^www\.youtube\.com$)|(^www\.youtu\.be$)/;

async function checkIfBlocked() {
    const response = await got.get("https://www.google.com/search?q=test", {
        headers: {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36",
            "accept-language": "en,en-US;q=0.9,fr;q=0.8,en-US;q=0.7",
            "accept-encoding": "gzip, deflate, br",
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
            "cookie": "GOOGLE_ABUSE_EXEMPTION=" + database.googleAbuseExemption
        },
        retry: 0,
        throwHttpErrors: false
    });
    if (response.statusCode == 429) {
        const json = await antiCaptcha.sendTask();
        const taskId = json.taskId;
        let status = "processing";
        let gRecaptchaResponse;
        while (status === "processing") {
            const taskInfo = await antiCaptcha.getTask(taskId);
            if (taskInfo.status === "ready") {
                status = "ready";
                gRecaptchaResponse = taskInfo.solution.gRecaptchaResponse;
            }
            await delay(10000);
        }
        database.googleAbuseExemption = await antiCaptcha.submitRecaptchaResponse(gRecaptchaResponse, response.url);
        await fsPromises.writeFile(databaseFilePath, JSON.stringify(database), 'utf8');
    }
}

setInterval(checkIfBlocked, 120000);

proxy.onError(function (ctx, err) {
    console.error('proxy error:', err);
});

proxy.onRequest((ctx, callback) => {
    if (googleHosts.test(ctx.clientToProxyRequest.headers.host)) {
        if (database.googleAbuseExemption) {
            ctx.proxyToServerRequestOptions.headers["Cookie"] = "GOOGLE_ABUSE_EXEMPTION=" + database.googleAbuseExemption;
        }
    }
    return callback();
});

proxy.listen({ port: port, sslCaDir: sslCAPath, keepAlive: true });
console.log("Proxy ready to accept requests on port: " + port);