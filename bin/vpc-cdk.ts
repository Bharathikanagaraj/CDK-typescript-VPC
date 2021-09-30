#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { VpcCdkStack } from '../lib/vpc-cdk-stack';
import { IAMCdkStack } from '../lib/IAM-cdk-stack'

const app = new cdk.App();
new VpcCdkStack(app, 'VpcCdkStack', {});
new IAMCdkStack(app, 'IamCdkStack', {});
