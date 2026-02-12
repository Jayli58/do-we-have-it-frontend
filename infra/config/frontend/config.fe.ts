import { sharedConfig } from "../shared";

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
    // Local-only path for CDK asset deployment
    localAssetPath: "C:/Users/Lee58/PhpstormProjects/do-we-have-it/frontend/out",
    authPaths: {
        redirectPathSignIn: "/parseauth",
        redirectPathSignOut: "/",
        redirectPathAuthRefresh: "/refreshauth",
        signOutUrl: "/signout",
    },
}
