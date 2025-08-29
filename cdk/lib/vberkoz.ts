import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'node:path';

interface VBerkozProps extends cdk.StackProps {
    domainName: string;
    env: {
        account: string | undefined;
        region: string | undefined;
    };
}

export class VBerkoz extends cdk.Stack {
    constructor(scope: Construct, id: string, props: VBerkozProps) {
        super(scope, id, props);

        const domain = props.domainName;
        const hostedZone = cdk.aws_route53.HostedZone.fromLookup(this, 'VBerkozZone', {
            domainName: props.domainName,
        });

        const cert = new cdk.aws_certificatemanager.Certificate(this, 'VBerkozCert', {
            domainName: domain,
            validation: cdk.aws_certificatemanager.CertificateValidation.fromDns(hostedZone),
        });

        const bucket = new cdk.aws_s3.Bucket(this, 'VBerkozBucket', {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            blockPublicAccess: cdk.aws_s3.BlockPublicAccess.BLOCK_ALL,
            autoDeleteObjects: true,
            publicReadAccess: false,
        });

        const oai = new cdk.aws_cloudfront.OriginAccessIdentity(this, 'VBerkozOAI');
        bucket.grantRead(oai);

        const cfFunction = new cdk.aws_cloudfront.Function(this, 'VBerkozIndexHtmlFunction', {
            code: cdk.aws_cloudfront.FunctionCode.fromInline(`
              function handler(event) {
                var request = event.request;
                var uri = request.uri;
      
                if (uri.endsWith("/")) {
                  request.uri += "index.html";
                } else if (!uri.includes(".")) {
                  request.uri += "/index.html";
                }
      
                return request;
              }
            `),
        });

        const distribution = new cdk.aws_cloudfront.Distribution(this, 'VBerkozDistribution', {
            defaultRootObject: 'index.html',
            defaultBehavior: {
                origin: cdk.aws_cloudfront_origins.S3BucketOrigin.withOriginAccessIdentity(bucket, {
                    originAccessIdentity: oai,
                }),
                viewerProtocolPolicy: cdk.aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                functionAssociations: [{
                    function: cfFunction,
                    eventType: cdk.aws_cloudfront.FunctionEventType.VIEWER_REQUEST,
                }],
            },
            domainNames: [domain],
            certificate: cert,
            errorResponses: [
                {
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                    ttl: cdk.Duration.minutes(5)
                },
                {
                    httpStatus: 403,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                    ttl: cdk.Duration.minutes(5)
                },
            ],
        });

        new cdk.aws_s3_deployment.BucketDeployment(this, 'VBerkozBucketDeployment', {
            sources: [
                cdk.aws_s3_deployment.Source.asset(path.join(process.cwd(), '../dist')),
            ],
            destinationBucket: bucket,
            distributionPaths: ['/*'],
            distribution,
        });

        new cdk.aws_route53.ARecord(this, 'VBerkozAliasRecord', {
            zone: hostedZone,
            recordName: domain,
            target: cdk.aws_route53.RecordTarget.fromAlias(new cdk.aws_route53_targets.CloudFrontTarget(distribution)),
        });
    }
}
