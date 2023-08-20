import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import path = require('path');

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const bucket = new s3.Bucket(this,"website",{
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      websiteIndexDocument: 'index.html'
    });
    // Global unique names (SO BE CAREFUL)
    new cdk.CfnOutput(this,"websiteArn",{
      value: bucket.bucketArn,
      exportName: "infraWebsiteArn"
    })
    new cdk.CfnOutput(this,"websiteBucketName", {
      value: bucket.bucketName,
      exportName: "infraWebsiteName" 
    })
  }
}

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const bucketArn = cdk.Fn.importValue("infraWebsiteArn");
    const bucketName = cdk.Fn.importValue("infraWebsiteName");
    const bucket = s3.Bucket.fromBucketArn(this,"website", bucketArn);

    // Ensure you add properties to remove objects if you want to rename.
    const site = new s3deploy.BucketDeployment(this,"webdeploy",{
      destinationBucket: bucket,
      sources:[s3deploy.Source.asset(path.join(__dirname, '..\\..\\website'))]
    })
  }
}
