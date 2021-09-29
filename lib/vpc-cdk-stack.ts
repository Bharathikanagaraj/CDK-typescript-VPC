import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';

export class VpcCdkStack extends cdk.Stack {
  
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //Default vpc creation with 2 public,2 private subnets 

    //const vpc = new ec2.Vpc(this, 'VPC-tsc');
    //.......vpc with custom subnets.......
    const vpc=new ec2.Vpc(this,'VPC-tsc',{
    cidr:'30.0.0.0/16',
    maxAzs:2,
    subnetConfiguration:[
      {
        subnetType:ec2.SubnetType.PUBLIC,
        name:'VPC-tsc-Public',
        cidrMask:24,
      },
      {
        subnetType:ec2.SubnetType.PRIVATE_ISOLATED,
        name:'VPC-tsc-Private',
        cidrMask:24,
      }
    ]  
    })

  }
}
