import * as cdk from 'aws-cdk-lib';
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import { feConfig } from "../config/frontend/config.fe";

interface FrontendStackProps extends cdk.StackProps {
    authPaths: {
        redirectPathSignIn: string;
        redirectPathSignOut: string;
        redirectPathAuthRefresh: string;
        signOutUrl: string;
    };
}


export class FrontendStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: FrontendStackProps) {
        super(scope, id, {
            ...props,
            description: "DWHI frontend"
        });

        // create S3 bucket
        const bucket = new s3.Bucket(this, 'DWHIFeBucket', {
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            encryption: s3.BucketEncryption.S3_MANAGED,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });

        const accessLogBucket = new s3.Bucket(this, "DWHIFeAccessLogsBucket", {
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            encryption: s3.BucketEncryption.S3_MANAGED,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            enforceSSL: true,
            objectOwnership: s3.ObjectOwnership.OBJECT_WRITER,
            accessControl: s3.BucketAccessControl.LOG_DELIVERY_WRITE,
        });

        // cert
        const certArn = ssm.StringParameter.valueForStringParameter(this, feConfig.ssmParamName4CertArn);
        const cert = acm.Certificate.fromCertificateArn(this, "ImportedFeCert", certArn);

        const checkAuthHandlerArn = ssm.StringParameter.valueForStringParameter(
            this,
            feConfig.authAtEdgeSsmParamNames.checkAuthHandlerArn,
        );
        const parseAuthHandlerArn = ssm.StringParameter.valueForStringParameter(
            this,
            feConfig.authAtEdgeSsmParamNames.parseAuthHandlerArn,
        );
        const refreshAuthHandlerArn = ssm.StringParameter.valueForStringParameter(
            this,
            feConfig.authAtEdgeSsmParamNames.refreshAuthHandlerArn,
        );
        const signOutHandlerArn = ssm.StringParameter.valueForStringParameter(
            this,
            feConfig.authAtEdgeSsmParamNames.signOutHandlerArn,
        );

        const checkAuthHandler = lambda.Version.fromVersionArn(
            this,
            "AuthAtEdgeCheckAuthHandler",
            checkAuthHandlerArn,
        );
        const parseAuthHandler = lambda.Version.fromVersionArn(
            this,
            "AuthAtEdgeParseAuthHandler",
            parseAuthHandlerArn,
        );
        const refreshAuthHandler = lambda.Version.fromVersionArn(
            this,
            "AuthAtEdgeRefreshAuthHandler",
            refreshAuthHandlerArn,
        );
        const cspHeadersHandler = new cloudfront.experimental.EdgeFunction(this, "DwhiCspHeadersHandler", {
            runtime: lambda.Runtime.NODEJS_22_X,
            handler: "index.handler",
            code: lambda.Code.fromAsset(path.join(__dirname, "..", "edge-lambdas", "csp-nonce")),
            description: "Inject CSP nonces and security headers",
        });

        const cspHeadersHandlerVersion = cspHeadersHandler.currentVersion;
        const apiRewriteHandler = new cloudfront.experimental.EdgeFunction(this, "DwhiApiRewriteHandler", {
            runtime: lambda.Runtime.NODEJS_22_X,
            handler: "index.handler",
            code: lambda.Code.fromAsset(path.join(__dirname, "..", "edge-lambdas", "api-rewrite")),
            description: "Rewrite /api prefix for backend origin",
        });

        const apiRewriteHandlerVersion = apiRewriteHandler.currentVersion;
        const signOutHandler = lambda.Version.fromVersionArn(
            this,
            "AuthAtEdgeSignOutHandler",
            signOutHandlerArn,
        );

        const frontendAssetPath = process.env.MYAPP_ROOT
            ? path.resolve(process.env.MYAPP_ROOT, "out")
            : feConfig.localAssetPath;

        const authBehaviorDefaults: cloudfront.BehaviorOptions = {
            origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
            viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
            // let cloudfront forward all viewer headers, cookies, and query strings to the origin
            // this is required for the auth at edge flow to work correctly
            originRequestPolicy: new cloudfront.OriginRequestPolicy(this, "DwhiAuthOriginRequestPolicy", {
                // allow tokens to be passed to the frontend via cookie
                cookieBehavior: cloudfront.OriginRequestCookieBehavior.all(),
                queryStringBehavior: cloudfront.OriginRequestQueryStringBehavior.none(),
                // do not forward headers as s3 would reject access
                headerBehavior: cloudfront.OriginRequestHeaderBehavior.none(),
            }),
        };

        const staticAssetBehaviorDefaults: cloudfront.BehaviorOptions = {
            origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
            viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
            originRequestPolicy: cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN,
        };

        // forward api requests to api domain
        const apiOrigin = new origins.HttpOrigin(feConfig.apiDomain, {
            protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
        });

        const cfDistro = new cloudfront.Distribution(this, 'DWHIFeDistro', {
            defaultRootObject: 'index.html',
            domainNames: [feConfig.domain],
            certificate: cert,
            logBucket: accessLogBucket,
            logFilePrefix: "cloudfront/",
            // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_cloudfront.ViewerProtocolPolicy.html
            defaultBehavior: {
                ...authBehaviorDefaults,
                // enforce auth at edge
                // https://github.com/aws-samples/cloudfront-authorization-at-edge/blob/master/example-serverless-app-reuse/reuse-auth-only.yaml
                edgeLambdas: [
                    {
                        eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
                        functionVersion: checkAuthHandler,
                    },
                    {
                        eventType: cloudfront.LambdaEdgeEventType.VIEWER_RESPONSE,
                        functionVersion: cspHeadersHandlerVersion,
                    },
                ],
            },
            // additional auth paths for sign in, sign out, and refresh in cloudfront
            // paths are defined in auth at edge stack
            additionalBehaviors: {
                // bypass auth at edge for static assets
                "_next/static/*": {
                    ...staticAssetBehaviorDefaults,
                    edgeLambdas: [
                        {
                            eventType: cloudfront.LambdaEdgeEventType.VIEWER_RESPONSE,
                            functionVersion: cspHeadersHandlerVersion,
                        },
                    ],
                },
                // this is to enable auto refresh of auth token when sending requests to api
                "api/*": {
                    // forward api requests to api domain
                    origin: apiOrigin,
                    // enforce https
                    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
                    cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
                    // forward all headers except host, plus cookies and query strings
                    originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
                    // run auth at edge to check if the user is authenticated
                    edgeLambdas: [
                        {
                            eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
                            functionVersion: checkAuthHandler,
                        },
                        // rewrite /api prefix for backend origin
                        // e.g. /api/users -> /users
                        {
                            eventType: cloudfront.LambdaEdgeEventType.ORIGIN_REQUEST,
                            functionVersion: apiRewriteHandlerVersion,
                        },
                    ],
                },
                "_next/image/*": {
                    ...staticAssetBehaviorDefaults,
                    edgeLambdas: [
                        {
                            eventType: cloudfront.LambdaEdgeEventType.VIEWER_RESPONSE,
                            functionVersion: cspHeadersHandlerVersion,
                        },
                    ],
                },
                [props.authPaths.redirectPathSignIn]: {
                    ...authBehaviorDefaults,
                    edgeLambdas: [
                        {
                            eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
                            functionVersion: parseAuthHandler,
                        },
                        {
                            eventType: cloudfront.LambdaEdgeEventType.VIEWER_RESPONSE,
                            functionVersion: cspHeadersHandlerVersion,
                        },
                    ],
                },
                [props.authPaths.redirectPathAuthRefresh]: {
                    ...authBehaviorDefaults,
                    edgeLambdas: [
                        {
                            eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
                            functionVersion: refreshAuthHandler,
                        },
                        {
                            eventType: cloudfront.LambdaEdgeEventType.VIEWER_RESPONSE,
                            functionVersion: cspHeadersHandlerVersion,
                        },
                    ],
                },
                [props.authPaths.signOutUrl]: {
                    ...authBehaviorDefaults,
                    edgeLambdas: [
                        {
                            eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
                            functionVersion: signOutHandler,
                        },
                        {
                            eventType: cloudfront.LambdaEdgeEventType.VIEWER_RESPONSE,
                            functionVersion: cspHeadersHandlerVersion,
                        },
                    ],
                },
            },
        });

        // deploy next static codes onto s3 bucket (local-only)
        // ci does not use this; ci is in github actions
        new s3deploy.BucketDeployment(this, "DeployDWHIFe", {
            sources: [s3deploy.Source.asset(frontendAssetPath)],
            destinationBucket: bucket,
            distribution: cfDistro,
            // to invalidate cloudfront cache
            distributionPaths: ["/*"],
        });

        // github oidc for github actions to deploy frontend
        const githubOidcProviderArn = ssm.StringParameter.valueForStringParameter(
            this,
            feConfig.ssmParamName4GithubOidcProviderArn,
        );
        const githubOidcProvider = iam.OpenIdConnectProvider.fromOpenIdConnectProviderArn(
            this,
            "GitHubOidcProvider",
            githubOidcProviderArn,
        );

        const githubDeployRole = new iam.Role(this, "GitHubDWHIFeDeployRole", {
            description: "GitHub Actions role for DWHI frontend deploy",
            assumedBy: new iam.FederatedPrincipal(
                githubOidcProvider.openIdConnectProviderArn,
                {
                    "StringEquals": {
                        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
                    },
                    "StringLike": {
                        "token.actions.githubusercontent.com:sub": [
                            `repo:${feConfig.githubOidcRepo}:ref:refs/heads/main`,
                            // for github actions workflow (approval)
                            `repo:${feConfig.githubOidcRepo}:environment:production`
                        ],
                    },
                },
                "sts:AssumeRoleWithWebIdentity",
            ),
        });

        githubDeployRole.addToPolicy(new iam.PolicyStatement({
            actions: [
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket",
            ],
            resources: [bucket.bucketArn, `${bucket.bucketArn}/*`],
        }));

        githubDeployRole.addToPolicy(new iam.PolicyStatement({
            actions: ["cloudfront:CreateInvalidation"],
            resources: [
                `arn:aws:cloudfront::${cdk.Stack.of(this).account}:distribution/${cfDistro.distributionId}`,
            ],
        }));

        new cdk.CfnOutput(this, 'CloudFrontUrl', {
            value: `https://${cfDistro.domainName}`,
        });

        new cdk.CfnOutput(this, "FrontendBucketName", {
            value: bucket.bucketName,
        });

        new cdk.CfnOutput(this, "FrontendDistributionId", {
            value: cfDistro.distributionId,
        });

        new cdk.CfnOutput(this, "FrontendGithubDeployRoleArn", {
            value: githubDeployRole.roleArn,
        });
    }
}
