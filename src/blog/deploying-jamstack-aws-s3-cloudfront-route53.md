---
title: 'Deploying a Jamstack Site to AWS with S3, CloudFront & Route 53'
pubDate: 2025-05-05
updatedDate: 2025-05-05
description: 'Learn how to deploy a Jamstack site on AWS using S3 for storage, CloudFront for content delivery, and Route 53 for DNS, creating a scalable and efficient hosting solution.'
author: 'Vasyl Berkoz'
image:
    url: ''
    alt: ''
tags: ["aws", "web-development", "architecture"]
og_title: "Deploying a Jamstack Site to AWS with S3, CloudFront & Route 53"
og_description: "Learn how to deploy a Jamstack site on AWS using S3 for storage, CloudFront for content delivery, and Route 53 for DNS, creating a scalable and efficient hosting solution."
og_type: "article"
og_url: "https://vberkoz.com/posts/deploying-jamstack-aws-s3-cloudfront-route53"
---

So you've built a blazing-fast Jamstack site. Maybe it's a personal portfolio, a blog, or a small business website. You’ve used modern tools like Astro, Next.js, or Gatsby to pre-render your content, and you’re ready to share it with the world. But now comes the big question: where do you host it? While many services offer easy one-click deployments, a DIY approach using Amazon Web Services (AWS) gives you unparalleled control, scalability, and a deep understanding of modern web architecture.

In this post, we'll walk through the process of deploying a Jamstack site to AWS, leveraging the trifecta of S3, CloudFront, and Route 53. We'll demystify the setup and show you how to create a robust, cost-effective, and highly-performant hosting solution.

### **Why AWS? 🤔**

AWS might seem daunting at first, but for a static site, the components we'll use are surprisingly straightforward and incredibly powerful.

  * **Scalability:** S3 and CloudFront are designed to handle massive traffic spikes with ease, ensuring your site remains available no matter how popular it gets.
  * **Performance:** CloudFront's global network of edge locations caches your site's content close to your users, drastically reducing latency.
  * **Cost-Effectiveness:** S3 and CloudFront are pay-as-you-go services. For most static sites, your monthly bill will be a few dollars, if not less.
  * **Control:** You own the entire infrastructure. This gives you the flexibility to add more AWS services like Lambda functions for serverless APIs or Cognito for user authentication.

Let's dive in\!

### **Step 1: The S3 Bucket - Your Site's Home 🏠**

Amazon S3 (Simple Storage Service) is an object storage service. Think of it as a virtual hard drive in the cloud. We'll use it to store all the static files of your website (HTML, CSS, JavaScript, images, etc.).

> **Tip:** We're not using S3 for web hosting directly in the traditional sense. While S3 can be configured for static website hosting, we’ll use it as the "origin" for CloudFront, which offers superior performance and security features.

1.  **Create an S3 Bucket:** Log in to your AWS console and navigate to the S3 service. Click "Create bucket."
2.  **Name and Region:** Choose a unique name for your bucket. It's best practice to give it the same name as your domain (e.g., `vberkoz.com`). Select a region close to your primary audience.
3.  **Disable Public Access:** By default, S3 buckets are private. **Keep this setting enabled\!** This is a crucial security step. We will grant CloudFront permission to access the bucket, but not the public internet.
4.  **Upload Your Files:** Once the bucket is created, upload the contents of your build folder. This is the `dist`, `out`, or `public` directory created by your static site generator.

### **Step 2: CloudFront - The Global CDN 🌐**

CloudFront is AWS's Content Delivery Network (CDN). It caches your site's content at over 400 edge locations worldwide. When a user visits your site, CloudFront serves the files from the closest edge location, resulting in lightning-fast load times.

1.  **Create a CloudFront Distribution:** Go to the CloudFront service in the AWS console and click "Create distribution."
2.  **Origin Domain:** In the "Origin domain" field, you'll see a list of your S3 buckets. Select the bucket you just created.
3.  **Origin Access Control (OAC):** This is the modern and secure way to connect CloudFront to your S3 bucket. Create a new OAC. This will automatically generate a bucket policy for you to copy and paste into your S3 bucket's permissions. This policy ensures that only CloudFront can access your bucket.
4.  **Default Root Object:** Set the "Default root object" to `index.html`. This tells CloudFront what file to serve when a user visits your root URL (e.g., `https://vberkoz.com`).
5.  **Alternative Domain Names (CNAMEs):** Add your domain name here (e.g., `vberkoz.com` and `www.vberkoz.com`). This is essential for connecting your domain later.
6.  **SSL Certificate:** CloudFront provides a free SSL certificate. In the "Custom SSL certificate" section, choose the "Request Certificate" option. AWS Certificate Manager (ACM) will guide you through creating and validating a certificate for your domain.
7.  **Finalize:** Review the settings and create the distribution. It can take a few minutes for the distribution to be deployed.

### **Step 3: Route 53 - The DNS Powerhouse 🗺️**

Amazon Route 53 is a highly available and scalable DNS (Domain Name System) web service. It translates human-friendly domain names into IP addresses.

> **Note:** If you already own a domain and it's hosted elsewhere, you'll need to transfer it to Route 53 or update your existing DNS records with the CloudFront CNAME. For this guide, we'll assume your domain is managed by Route 53.

1.  **Create a Hosted Zone:** In the Route 53 console, create a new "Hosted zone" for your domain (e.g., `vberkoz.com`).
2.  **Create Records:** In your hosted zone, click "Create record."
      * **Record 1 (A Record):** This will be for your root domain (`vberkoz.com`).
          * **Record name:** Leave this blank.
          * **Record type:** Choose "A - Routes traffic to an IPv4 address and some AWS resources."
          * **Alias:** Enable the "Alias" toggle.
          * **Route traffic to:** Select "Alias to CloudFront distribution" and then choose your CloudFront distribution from the dropdown list.
      * **Record 2 (CNAME Record - optional but recommended):** This is for the `www` subdomain.
          * **Record name:** Enter `www`.
          * **Record type:** Choose "CNAME - Routes traffic to another domain name."
          * **Alias:** Enable the "Alias" toggle.
          * **Route traffic to:** Select "Alias to CloudFront distribution" and choose your distribution.

It may take a few minutes for these DNS changes to propagate across the internet.

### **Troubleshooting & Next Steps ⚙️**

  * **S3 Bucket Permissions:** If you see an "Access Denied" error, double-check that the bucket policy generated by the OAC in CloudFront has been correctly applied to your S3 bucket's "Permissions" tab.
  * **Redirects & SPAs:** For Single-Page Applications (SPAs) like those built with React or Vue, you’ll need to configure CloudFront to handle routing. You can create a custom error page for 403 and 404 errors that redirects all requests to `index.html`. This ensures that refreshing a sub-page (e.g., `/about`) works correctly.
  * **Automate Deployment:** Manually uploading files to S3 is fine for a one-off, but for a real project, you'll want to automate this process. Consider using GitHub Actions, GitLab CI/CD, or AWS's own CodePipeline and CodeBuild to automatically build and deploy your site on every commit to your main branch.

### **Conclusion 🎉**

By combining the power of S3, CloudFront, and Route 53, you've created a professional-grade hosting setup for your Jamstack site. You've gone beyond the "one-click" services and built a scalable, secure, and lightning-fast architecture. This knowledge not only gives you full control over your web presence but also a deeper understanding of how the modern web works, a skill that will serve you well in any development career. Happy deploying\!