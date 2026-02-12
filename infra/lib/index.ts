import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { BaseStack } from './base-stack';
import { FrontendStack } from './frontend-stack';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const baseStack = new BaseStack(this, 'BaseStack4DWHI');
    const frontendStack = new FrontendStack(this, 'DWHIFrontendStack');
  }
}
