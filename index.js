"use strict";

import Proxy from "http-mitm-proxy";
import * as antiCaptcha from "./anticaptcha.js";
import { promises as fsPromises } from "fs";
import fs from "fs";

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

proxy.onError(function (ctx, err) {
    console.error('proxy error:', err);
});

proxy.onRequest((ctx, callback) => {
    if (googleHosts.test(ctx.clientToProxyRequest.headers.host)) {
        if (ctx.clientToProxyRequest.url.indexOf("/sorry") == 0) {
            if (!database.taskId) {
                database.status = "processing";
                antiCaptcha.sendTask().then(json => {
                    console.log("sending task");
                    database.taskId = json.taskId;
                }).catch(() => delete database.status);
            }
            else if (database.taskId && database.status === "processing") {
                antiCaptcha.getTask(database.taskId).then(json => {
                    if (json.status === "ready") {
                        try {
                            antiCaptcha.submitRecaptchaResponse(json.solution.gRecaptchaResponse, ctx.clientToProxyRequest.url).then(cookieGoogleAbuseExemption => {
                                database.googleAbuseExemption = cookieGoogleAbuseExemption;
                                delete database.taskId;
                                delete database.status;
                                fsPromises.writeFile(databaseFilePath, JSON.stringify(database), 'utf8');
                            });
                        } catch (error) {
                            delete database.taskId;
                            database.status = "error";
                        }
                    }
                });
            }
        }
        else {
            if (database.googleAbuseExemption) {
                ctx.proxyToServerRequestOptions.headers["Cookie"] = "GOOGLE_ABUSE_EXEMPTION=" + database.googleAbuseExemption;
            }
        }
    }
    return callback();
});

proxy.listen({ port: port, sslCaDir: sslCAPath });
console.log("Proxy ready to accept requests on port: " + port);