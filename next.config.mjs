const archives = [
  ['/blog/photos.html', '/explore/photos'],
  ['/travel/travel.html', '/explore/travel'],
  ['/media/media.html', '/explore/media'],
  ['/email_success.html', '/explore/subscribed'],
];

export default {
  poweredByHeader: false,
  outputFileTracingIncludes: { '/*': ['./content/post-01.md'], '/home-view': ['./content/original-home.html'] },
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/blog/blog.html', destination: '/blog', permanent: true },
      { source: '/travel/Iceland.html', destination: '/explore/iceland', permanent: true },
      { source: '/blog/post-01.html', destination: '/blog/post-01', permanent: true },
      { source: '/project-ethicraft.html', destination: 'https://vlink.cc/ethicraft', permanent: true },
      ...archives.map(([source, destination]) => ({
        source, destination, missing: [{ type: 'query', key: 'embedded', value: '1' }], permanent: true,
      })),
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
