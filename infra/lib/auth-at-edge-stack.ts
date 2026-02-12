import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as sam from "aws-cdk-lib/aws-sam";

export interface AuthAtEdgeStackProps extends cdk.StackProps {
    userPoolArn: string;
    userPoolClientId: string;
    userPoolAuthDomain: string;
    frontendDomain: string;
    redirectPathSignIn: string;
    redirectPathSignOut: string;
    redirectPathAuthRefresh: string;
    signOutUrl: string;
}

export class AuthAtEdgeStack extends cdk.Stack {
    public readonly checkAuthHandlerArn: string;
    public readonly parseAuthHandlerArn: string;
    public readonly refreshAuthHandlerArn: string;
    public readonly httpHeadersHandlerArn: string;
    public readonly signOutHandlerArn: string;
    public readonly redirectPathSignIn: string;
    public readonly redirectPathSignOut: string;
    public readonly redirectPathAuthRefresh: string;
    public readonly signOutUrl: string;

    constructor(scope: Construct, id: string, props: AuthAtEdgeStackProps) {
        super(scope, id, {
            ...props,
            description: "Lambda@Edge auth for DWHI frontend",
        });

        // create auth at edge
        // ref: https://github.com/aws-samples/cloudfront-authorization-at-edge/blob/master/example-serverless-app-reuse/reuse-complete-cdk.ts
        const authAtEdge = new sam.CfnApplication(this, "AuthorizationAtEdge", {
            location: {
                applicationId:
                    "arn:aws:serverlessrepo:us-east-1:520945424137:applications/cloudfront-authorization-at-edge",
                semanticVersion: "2.3.2",
            },
            parameters: {
                EmailAddress: "",
                CreateCloudFrontDistribution: "false",
                EnableSPAMode: "true",
                UserPoolArn: props.userPoolArn,
                UserPoolClientId: props.userPoolClientId,
                UserPoolAuthDomain: props.userPoolAuthDomain,
                RedirectPathSignIn: props.redirectPathSignIn,
                RedirectPathSignOut: props.redirectPathSignOut,
                RedirectPathAuthRefresh: props.redirectPathAuthRefresh,
                SignOutUrl: props.signOutUrl,
                Aliases: props.frontendDomain,
            },
        });

        this.checkAuthHandlerArn = authAtEdge.getAtt("Outputs.CheckAuthHandler").toString();
        this.parseAuthHandlerArn = authAtEdge.getAtt("Outputs.ParseAuthHandler").toString();
        this.refreshAuthHandlerArn = authAtEdge.getAtt("Outputs.RefreshAuthHandler").toString();
        this.httpHeadersHandlerArn = authAtEdge.getAtt("Outputs.HttpHeadersHandler").toString();
        this.signOutHandlerArn = authAtEdge.getAtt("Outputs.SignOutHandler").toString();
        this.redirectPathSignIn = props.redirectPathSignIn;
        this.redirectPathSignOut = props.redirectPathSignOut;
        this.redirectPathAuthRefresh = props.redirectPathAuthRefresh;
        this.signOutUrl = props.signOutUrl;

        new cdk.CfnOutput(this, "AuthAtEdgeCheckAuthHandlerArn", {
            value: this.checkAuthHandlerArn,
        });

        new cdk.CfnOutput(this, "AuthAtEdgeParseAuthHandlerArn", {
            value: this.parseAuthHandlerArn,
        });

        new cdk.CfnOutput(this, "AuthAtEdgeRefreshAuthHandlerArn", {
            value: this.refreshAuthHandlerArn,
        });

        new cdk.CfnOutput(this, "AuthAtEdgeHttpHeadersHandlerArn", {
            value: this.httpHeadersHandlerArn,
        });

        new cdk.CfnOutput(this, "AuthAtEdgeSignOutHandlerArn", {
            value: this.signOutHandlerArn,
        });
    }
}
