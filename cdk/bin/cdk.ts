#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { VBerkoz } from '../lib/vberkoz';

const app = new cdk.App();
new VBerkoz(app, 'VBerkoz', {
  domainName: 'vberkoz.com',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});