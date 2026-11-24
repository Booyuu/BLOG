export default {
  poweredByHeader: false,
  outputFileTracingIncludes: { '/*': ['./content/post-01.md'] },
  async rewrites() {
    return [{ source: '/', destination: '/index.html' }];
  },
  async redirects() {
    return [
      { source: '/blog/blog.html', destination: '/blog', permanent: true },
      { source: '/blog/post-01.html', destination: '/blog/post-01', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'private, no-store' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ];
  },
};
