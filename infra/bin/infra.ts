#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { InfraStack } from '../lib';
import { FrontendCertStack } from '../lib/frontend-cert-stack';

const app = new cdk.App();

const account = process.env.CDK_DEFAULT_ACCOUNT!;
const region = process.env.CDK_DEFAULT_REGION!;

new FrontendCertStack(app, "DWHIFrontendCertStack", {
  env: { account, region: "us-east-1" },
});

new InfraStack(app, 'InfraStack', {
  env: { account: account, region: region },
});
