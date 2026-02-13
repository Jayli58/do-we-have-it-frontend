import * as cdk from 'aws-cdk-lib';
import { Construct } from "constructs";
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { feConfig } from "../config/frontend/config.fe";

interface FrontendStackProps extends cdk.StackProps {
    authPaths: {
        redirectPathSignIn: string;
        redirectPathSignOut: string;
        redirectPathAuthRefresh: string;
        signOutUrl: string;
    };
    authLambdaArns: {
        checkAuthHandlerArn: string;
        parseAuthHandlerArn: string;
        refreshAuthHandlerArn: string;
        httpHeadersHandlerArn: string;
        signOutHandlerArn: string;
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

        // cert
        const certArn = ssm.StringParameter.valueForStringParameter(this, feConfig.ssmParamName4CertArn);
        const cert = acm.Certificate.fromCertificateArn(this, "ImportedFeCert", certArn);

        const checkAuthHandler = lambda.Version.fromVersionArn(
            this,
            "AuthAtEdgeCheckAuthHandler",
            props.authLambdaArns.checkAuthHandlerArn,
        );
        const parseAuthHandler = lambda.Version.fromVersionArn(
            this,
            "AuthAtEdgeParseAuthHandler",
            props.authLambdaArns.parseAuthHandlerArn,
        );
        const refreshAuthHandler = lambda.Version.fromVersionArn(
            this,
            "AuthAtEdgeRefreshAuthHandler",
            props.authLambdaArns.refreshAuthHandlerArn,
        );
        const httpHeadersHandler = lambda.Version.fromVersionArn(
            this,
            "AuthAtEdgeHttpHeadersHandler",
            props.authLambdaArns.httpHeadersHandlerArn,
        );
        const signOutHandler = lambda.Version.fromVersionArn(
            this,
            "AuthAtEdgeSignOutHandler",
            props.authLambdaArns.signOutHandlerArn,
        );

        const authBehaviorDefaults: cloudfront.BehaviorOptions = {
            origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
            viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
            // let cloudfront forward all viewer headers, cookies, and query strings to the origin
            // this is required for the auth at edge flow to work correctly
            originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
        };

        const cfDistro = new cloudfront.Distribution(this, 'DWHIFeDistro', {
            defaultRootObject: 'index.html',
            domainNames: [feConfig.domain],
            certificate: cert,
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
                        eventType: cloudfront.LambdaEdgeEventType.ORIGIN_RESPONSE,
                        functionVersion: httpHeadersHandler,
                    },
                ],
            },
            // additional auth paths for sign in, sign out, and refresh in cloudfront
            // paths are defined in auth at edge stack
            additionalBehaviors: {
                [props.authPaths.redirectPathSignIn]: {
                    ...authBehaviorDefaults,
                    edgeLambdas: [
                        {
                            eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
                            functionVersion: parseAuthHandler,
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
                    ],
                },
                [props.authPaths.signOutUrl]: {
                    ...authBehaviorDefaults,
                    edgeLambdas: [
                        {
                            eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
                            functionVersion: signOutHandler,
                        },
                    ],
                },
            },
        });

        // deploy next static codes onto s3 bucket (local-only)
        // ci does not use this; ci is in github actions
        new s3deploy.BucketDeployment(this, 'DeployDWHIFe', {
            sources: [s3deploy.Source.asset(feConfig.localAssetPath)],
            destinationBucket: bucket,
            distribution: cfDistro,
            // to invalidate cloudfront cache
            distributionPaths: ['/*']
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
