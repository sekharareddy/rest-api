const { returnStateHandler } = require("../utils/returnStateHandler");
const { OAuth2Client } = require("google-auth-library");
const appData = require('../../App_Data/config.json')
const { getUserByEmail, getUserByLogin, createUser } = require("../models-mssql/AppUser");
const HttpStatus = require("../utils/http_codes.json");
const { getByTenantId } = require("../models-mssql/App");

var auth = async function (req, res, next) {
    console.log("enter auth: ");
    
    // console.log(req.query)
    var token, error;
    // console.log(req.headers);
    if (!req.headers || !req.headers.tokensource
        || (req.headers.tokensource !== 'google'
            && req.headers.tokensource !== 'passport')) {
        console.log('No valid auth tokens found');
        error = new Error("No valid auth tokens found !");
        error.status = HttpStatus.UNAUTHORIZED;
        error.success = false;
        error.message2 = "No valid auth tokens found !";
        return returnStateHandler(error, req, res, next);
    }
    else if (req.headers && req.headers.authorization) {
        console.log("Authorization token header found::: ");
        var parts = req.headers.authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            token = parts[1];
        } else {
            console.log("Parts length not found to be 2");
            error = new Error("No valid auth tokens found !");
            error.status = HttpStatus.UNAUTHORIZED;
            error.success = false;
            error.message2 = "No valid auth tokens found !";
            return returnStateHandler(error, req, res, next);
        }
    }
    else {
        error = new Error("No valid auth tokens found !");
        error.status = HttpStatus.UNAUTHORIZED;
        error.success = false;
        error.message2 = "No valid auth tokens found !";
        return returnStateHandler(error, req, res, next);
    }
    // RFC6750 states the access_token MUST NOT be provided
    // in more than one place in a single request.
    // TBD

    try {
        //console.log(req.query)
        let success = await getAppByTenantId(req);
        //console.log(success)
        if (success !== 1) {
            let error = new Error("App not found!");
            console.log(error.message);
            error.status = HttpStatus.BAD_REQUEST;
            error.success = false;
            error.message2 = "App not found!";
            return returnStateHandler(error, req, res, next);
        }
    } catch (error) {
        console.log(error);
        error.status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
        error.success = false;
        error.message = error.message || "Internal Server Error in Auth()!";
        error.message2 = "Internal Server Error in Auth()!";
        return returnStateHandler(error, req, res, next);
    }
    if (req.headers.tokensource === "google") {
        try {
            let google_client = "";
            const oAuthClientId = process.env.GOOGLE_CLIENT_ID || appData.GOOGLE_CLIENT_ID;
            google_client = new OAuth2Client(oAuthClientId);
            google_client
                .verifyIdToken({ idToken: token, audience: oAuthClientId })
                .then(async (ticket) => {
                    req.user = await getUserFromToken(req.headers.tokensource, ticket.getPayload(), req.query.tenantId, req.query.appId, req.query.orgId);
                    next();
                })
                .catch((error) => {
                    console.log(error);
                    error.status = error.status || HttpStatus.UNAUTHORIZED;
                    error.success = false;
                    error.message = error.message || "Internal Server Error in Auth()!";
                    error.message2 = "Internal Server Error in Auth()!";
                    return returnStateHandler(error, req, res, next);
                });
        } catch (error) {
            console.log(error);
            error.status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
            error.success = false;
            error.message = error.message || "Internal Server Error in Auth()!";
            error.message2 = "Internal Server Error in Auth()!";
            return returnStateHandler(error, req, res, next);
        }
    }
    else if (req.headers.tokensource === "passport") {
        try {
            let token_payload, token_str64;
            token_payload = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'))
            // console.log(JSON.stringify(token_payload))
            let decodedToken = {
                email: token_payload.passport.user.profile._json.email,
                name: token_payload.passport.user.profile._json.name,
                given_name: token_payload.passport.user.profile._json.first_name || token_payload.passport.user.profile._json.given_name,
                family_name: token_payload.passport.user.profile._json.last_name || token_payload.passport.user.profile._json.family_name,
                picture: token_payload.passport.user.profile._json.picture || token_payload.passport.user.profile._json.picture?.data.url,
                sub: token_payload.passport.user.profile._json.sub || token_payload.passport.user.profile._json.id,
                iss: token_payload.passport.user.profile.provider
            }
            req.user = await getUserFromToken(
                req.headers.tokensource, decodedToken, req.query.tenantId, req.query.appId, req.query.orgId);
            next();

        } catch (error) {
            console.log(error);
            error.status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
            error.success = false;
            error.message = error.message || "Internal Server Error in Auth()!";
            error.message2 = "Internal Server Error in Auth()!";
            return returnStateHandler(error, req, res, next);
        }
    }
    else {
        let error = new Error("Internal Server Error in Auth()!")
        error.status = error.status || HttpStatus.UNAUTHORIZED;
        error.success = false;
        error.message2 = "Internal Server Error in Auth()!";
        return returnStateHandler(error, req, res, next);
    }
}

const getAppByTenantId = async (req) => {

    if (req.query.tenantId && req.query.appId) {
        const data = await getByTenantId(req.query.tenantId, req.query.appId)
        //console.log(req.query.tenantId, req.query.appId, data);
        if (data) {
            return 1;
        }
        else {
            return 0;
        }
    }
    else {
        return 0;
    }
};

const getUserFromToken = async (tokenSource, token, tenantId, appId, orgId=null) => {
    let user = await getUserByLogin(tenantId, appId, tokenSource, token.email);
    if (!user) {
        userLogin = {
            tokenSource: tokenSource,
            email: token.email,
            oAuth_iss: token.iss,
            oAuth_sub: token.sub,
            tenantId: tenantId,
            appId: appId,
            orgId: orgId
        }
        appUser = {
            userName: token.email,
            tokenSource: tokenSource,
            email: token.email,
            userFirstName: token.given_name,
            userLastName: token.family_name,
            userFullName: token.name,
            pictureURL: token.picure,
            tenantId: tenantId,
            appId: appId,
            orgId: orgId
        }
        user = await createUser(appUser, userLogin);
    }
    return user;
};

module.exports = {
    auth,
};
