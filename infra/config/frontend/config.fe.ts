import { sharedConfig } from "../shared";

import * as path from "path";

const repoRoot = path.resolve(__dirname, "..", "..", "..");

export const feConfig = {
    domain: sharedConfig.domain,
    // obtain from FrontendCertStack output in us-east-1 for cloudfront
    ssmParamName4CertArn: '/dwhi/fe/certArn',
    // url for cognito callback
    callbackUrls: [
        `https://${sharedConfig.domain}/parseauth`,
    ],
    // url for cognito sign-out
    logoutUrls: [
        `https://${sharedConfig.domain}/`,
    ],
    // GitHub repo for OIDC trust in frontend stack (owner/repo)
    githubOidcRepo: "Jayli58/do-we-have-it-frontend",
    // existing GitHub OIDC provider ARN stored in SSM
    ssmParamName4GithubOidcProviderArn: "/dwhi/github/oidc/providerArn",
    // Local-only path for CDK asset deployment
    localAssetPath:
        process.env.FE_LOCAL_ASSET_PATH ??
        path.join(repoRoot, "frontend", "out"),
    authPaths: {
        redirectPathSignIn: "/parseauth",
        redirectPathSignOut: "/",
        redirectPathAuthRefresh: "/refreshauth",
        signOutUrl: "/signout",
    },
    authAtEdgeSsmParamNames: {
        checkAuthHandlerArn: "/dwhi/auth-at-edge/checkAuthHandlerArn",
        parseAuthHandlerArn: "/dwhi/auth-at-edge/parseAuthHandlerArn",
        refreshAuthHandlerArn: "/dwhi/auth-at-edge/refreshAuthHandlerArn",
        httpHeadersHandlerArn: "/dwhi/auth-at-edge/httpHeadersHandlerArn",
        signOutHandlerArn: "/dwhi/auth-at-edge/signOutHandlerArn",
    }
}
