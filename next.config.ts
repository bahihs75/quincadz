import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default withSentryConfig(nextConfig, {
  org: "your-org-slug",
  project: "quincadz",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
});
