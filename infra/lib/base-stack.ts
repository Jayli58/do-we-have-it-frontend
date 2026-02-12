import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
// import * as ssm from 'aws-cdk-lib/aws-ssm';
import { feConfig } from '../config/frontend/config.fe';

export class BaseStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, {
        ...props,
        description: "Frontend infra: Cognito for DWHI app"
      });
  
      // configure Cognito
      const userpool = new cognito.UserPool(this, 'DWHIUserpool', {
        userPoolName: 'dwhi-userpool',
        signInCaseSensitive: false,
        selfSignUpEnabled: true,
        // sign in with email only
        signInAliases: {
          email: true,
        },
        // autoVerify: { email: true }
        // need email, name for sign up
        standardAttributes: {
          email: {
            required: true,
            mutable: false,
          },
          fullname: {
            required: true,
            mutable: false,
          },
        },
        passwordPolicy: {
          minLength: 8,
          requireLowercase: true,
          requireUppercase: false,
          requireDigits: true,
          requireSymbols: false,
        },
      });
  
      // add cognito domain
      const stack = cdk.Stack.of(this);
  
      const domain = userpool.addDomain('TodoAppUserpoolDomain', {
        cognitoDomain: {
          domainPrefix: `todoapp-dev-jayli-${stack.region}`,
        },
        managedLoginVersion: cognito.ManagedLoginVersion.NEWER_MANAGED_LOGIN,
      });
  
      // create app client
      const appClient = userpool.addClient("TodoAppClient", {
        authFlows: {
          userSrp: true
        },
        oAuth: {
          flows: {
            authorizationCodeGrant: true,
          },
          scopes: [
            cognito.OAuthScope.OPENID,
            cognito.OAuthScope.EMAIL,
            cognito.OAuthScope.PROFILE,
          ],
          callbackUrls: [
            ...feConfig.callbackUrls,
          ],
        },
        // PKCE
        generateSecret: false,
      });
  
      // 2) enable login UI
      new cognito.CfnManagedLoginBranding(this, "TodoAppManagedLoginBranding", {
        userPoolId: userpool.userPoolId,
        clientId: appClient.userPoolClientId,
        useCognitoProvidedValues: true,
      });
  
      // store cognito info into ssm
    //   new ssm.StringParameter(this, "UserPoolIdParam", {
    //     parameterName: `${apiConfig.Ssm__BasePath}/cognito/userPoolId`,
    //     stringValue: userpool.userPoolId,
    //   });
  
    //   new ssm.StringParameter(this, "UserPoolClientIdParam", {
    //     parameterName: `${apiConfig.Ssm__BasePath}/cognito/clientId`,
    //     stringValue: appClient.userPoolClientId,
    //   });
  
    //   new ssm.StringParameter(this, "CognitoRegionParam", {
    //     parameterName: `${apiConfig.Ssm__BasePath}/cognito/region`,
    //     stringValue: cdk.Stack.of(this).region,
    //   });
    }
}