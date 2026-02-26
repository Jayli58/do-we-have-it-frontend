## Do We Have It

This repo contains the DWHI frontend application and its AWS infrastructure. The frontend is a static-exported Next.js app deployed to S3 and CloudFront, protected by Cognito and Lambda@Edge auth (via the [cloudfront-authorization-at-edge](https://github.com/aws-samples/cloudfront-authorization-at-edge) Serverless Application).

Do We Have It is an inventory tracker for folders and items, with custom attributes, templates, and image uploads to describe what you own.

### TL;DR

![Architecture](./dwhi-arch-layout.svg)

### Repo contents

- `frontend/`: Next.js (React) app (static export) with MUI and Tailwind styles.
- `infra/`: AWS CDK stacks for Cognito, Lambda@Edge auth, CloudFront, S3 hosting, and CI/CD.
- `dwhi-arch-layout.svg`: Architecture diagram for the stack.

## Frontend

### Prerequisites

- Node.js 20+ (matches local build tooling)

### Local development

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to view the app.

### Static build

```bash
cd frontend
npm run build
```

The static export is emitted to `frontend/out` (used by CDK for local asset deployment).

### Environment variables

Create `frontend/.env.local` based on the example below. The example file is tracked so you can keep it in sync with expected config.

```bash
cp frontend/.env.example frontend/.env.local
```

Environment variables used by the frontend build:

- `NEXT_PUBLIC_API_BASE_URL`: Base URL for the backend API.
- `NEXT_PUBLIC_USE_DEMO_AUTH`: Set to `true` to enable demo auth (no Cognito flow).
- `NEXT_PUBLIC_FIELD_MAX`: Max field count/limit used by the UI.
- `NEXT_PUBLIC_COMMENT_MAX`: Max comment length used by the UI.
- `DWHI_OUT_DIR`: Output directory for the CSP hash script (defaults to `frontend/out`).

### Tests

```bash
cd frontend
npm test
```

## Infrastructure

### Prerequisites

- Node.js 20+
- AWS CDK v2 and credentials for deployment
- A hosted zone for the frontend domain (used for ACM validation)

### Key stacks

- `FrontendCertStack`: ACM certificate in `us-east-1` for CloudFront.
- `InfraStack`: Orchestrates Cognito (BaseStack), Lambda@Edge auth (AuthAtEdgeStack), and the frontend hosting stack.
- `FrontendStack`: S3 + CloudFront hosting, auth-at-edge behaviors, CSP nonce edge functions, and GitHub OIDC deploy role.
- `FrontendPipelineStack`: CodePipeline + CodeBuild pipeline for production deployments from S3 artifacts.

### Configuration

- `infra/config/shared.ts`: Domain, API domain, and shared SSM base path.
- `infra/config/frontend/config.fe.ts`: Frontend domain, auth paths, SSM parameter names, and local asset path.
- `infra/config/frontend/config.ci.ts`: CI artifact keys and GitHub OIDC repo settings.

### CI/CD overview

The CI flow uses GitHub Actions to upload zipped frontend/infra artifacts to an S3 source bucket. The `FrontendPipelineStack` CodePipeline listens for uploads, gates deployment with a manual approval step, and runs a CodeBuild job that deploys `InfraStack/DWHIFrontendStack` using the uploaded artifacts.

### Deploy (manual)

```bash
cd infra
npm install
npm run build
npx cdk deploy DWHIFrontendCertStack
npx cdk deploy InfraStack
```

`InfraStack` creates the Cognito user pool and client, deploys the Lambda@Edge authorization app, and provisions the CloudFront distribution and S3 bucket.

### Deploy (pipeline)

The CodePipeline stack expects zipped frontend and infra artifacts uploaded to the source bucket. GitHub Actions can upload artifacts using the OIDC role created by `FrontendPipelineStack`.

## Notes

- Lambda@Edge functions are sourced from `cloudfront-authorization-at-edge` (Serverless Application Repository) and wired into CloudFront behaviors.
- The frontend is protected by Cognito auth paths (`/parseauth`, `/refreshauth`, `/signout`).
- CloudFront applies optimized caching to static assets (for example `_next/static` and images) while dynamic/authenticated paths disable caching to avoid serving stale, unauthorized responses.
