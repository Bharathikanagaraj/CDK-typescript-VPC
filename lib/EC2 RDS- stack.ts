import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as rds from '@aws-cdk/aws-rds';
import * as iam from '@aws-cdk/aws-iam';
import * as s3 from '@aws-cdk/aws-s3';
import { Port, SecurityGroup } from '@aws-cdk/aws-ec2';
import { ManagedPolicy, Policy, Role } from '@aws-cdk/aws-iam';
import { generateKeyPairSync } from 'crypto';



export class EC2RDSStack extends cdk.Stack {
  
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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
        ], 
        })
    //securitygroup
    const securitygroup = new SecurityGroup(this, 'securityGroup',{
      allowAllOutbound: true,
      vpc,
      securityGroupName:'rds-sg'
    })
    securitygroup.addIngressRule(
      ec2.Peer.ipv4(vpc.vpcCidrBlock),
      ec2.Port.tcp(3306),
      'rds'
    )
    //rdscode
    const instance = new rds.DatabaseInstance(this, 'rds', {
      engine: rds.DatabaseInstanceEngine.mysql({ version:rds.MysqlEngineVersion.VER_8_0_25 }),
      // optional, defaults to m5.large
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.SMALL),
      credentials: rds.Credentials.fromGeneratedSecret('abcdef'), // Optional - will default to 'admin' username and generated password
      vpc:vpc,
      databaseName:'RDSDB',
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED
      },
      instanceIdentifier:'my-rds',  
      securityGroups: [securitygroup],
      removalPolicy: cdk.RemovalPolicy.DESTROY,    
    });

    //EC2 Creation
    
    //1.sg-creation
    const securitygroup1 = new SecurityGroup(this, 'securitygroup ec2',{
      allowAllOutbound: true,
      vpc,
      securityGroupName:'ec2-sg'
    })
    securitygroup1.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'Allow SSH Access'
    )
    securitygroup1.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allows HTTP access from Internet'
    )
    
    //iam role creation
    const role = new iam.Role(this,'simple-instance-role',{
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com') 
    })
    role.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'));

    //2.ec2-creation
    const ec2Instance = new ec2.Instance(this, 'ec2Instance',{
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinuxImage(),
      vpc,
      role: role,
      securityGroup:securitygroup1,
      instanceName:'EC2-CDK-Instance',
      //bydefault ec2 launced in private
      vpcSubnets:{
        subnetType: ec2.SubnetType.PUBLIC
      },
      keyName:'cdk',
    })
    //getting output for ssh
    new cdk.CfnOutput(this, 'ec2-output', {
      value: ec2Instance.instancePublicIp,
    })
    //S3 Bucket creation
    new s3.Bucket(this, 'myfirstbucket-typescript', {
      versioned: false,
      bucketName:'myfirstbucket-typescript',
      removalPolicy:cdk.RemovalPolicy.DESTROY, //to use auto removal run- "cdk bootstrap" in terminal before deploy
      autoDeleteObjects:true
    });
  }
}    
