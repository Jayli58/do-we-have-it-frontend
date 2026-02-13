import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { BaseStack } from './base-stack';
import { FrontendStack } from './frontend-stack';
import { AuthAtEdgeStack } from './auth-at-edge-stack';
import { feConfig } from '../config/frontend/config.fe';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const baseStack = new BaseStack(this, 'BaseStack4DWHI');
    const authAtEdgeStack = new AuthAtEdgeStack(this, "DWHIAuthAtEdgeStack", {
      userPoolArn: baseStack.userPool.userPoolArn,
      userPoolClientId: baseStack.userPoolClient.userPoolClientId,
      userPoolAuthDomain: baseStack.userPoolAuthDomain,
      frontendDomain: feConfig.domain,
      redirectPathSignIn: feConfig.authPaths.redirectPathSignIn,
      redirectPathSignOut: feConfig.authPaths.redirectPathSignOut,
      redirectPathAuthRefresh: feConfig.authPaths.redirectPathAuthRefresh,
      signOutUrl: feConfig.authPaths.signOutUrl,
    });
    const frontendStack = new FrontendStack(this, 'DWHIFrontendStack', {
      authPaths: feConfig.authPaths,
    });

    // stack dependencies
    // authAtEdgeStack.addDependency(baseStack);
    // frontendStack.addDependency(baseStack);
    // frontendStack.addDependency(authAtEdgeStack);
  }
}
