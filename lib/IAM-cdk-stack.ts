import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as ec2 from '@aws-cdk/aws-ec2';
import { Group, ManagedPolicy, PolicyStatement, Role, ServicePrincipal, User } from '@aws-cdk/aws-iam';
import { group } from 'console';


export class IAMCdkStack extends cdk.Stack {
  
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props);

      const role = new Role(this, 'myrole-tsc', {
        assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
      });

    //...S3 ReadOnlyAccess to the role....
      role.addToPolicy(new PolicyStatement({
        resources: ['*'],
        actions: [
            "s3:Get*",
            "s3:List*",
            "s3-object-lambda:Get*",
            "s3-object-lambda:List*"],
      }))
      //new user creation
      const user1=new User(this,'User1',{
          userName:'User1',
      });
      //...S3 FullAccess to the user....
      user1.addToPolicy(new PolicyStatement({
        resources: ['*'],
        actions: [
            "s3:*",
        ],
      }))

    //...aws managed policy...
    //   user1.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess'))
      const group1=new Group(this,'Group1',{
          groupName:'Group1',
      })
    //adding the user to the group1  
      user1.addToGroup(group1);
    //adding S3 FullAccess to the permissions
      group1.addToPolicy(new PolicyStatement({
        resources: ['*'],
        actions: [
            "s3:*",
        ],
      }))
    }
}      