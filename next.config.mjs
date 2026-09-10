/** @type {import('next').NextConfig} */
const nextConfig = {
  // Deliberately no `images` config: the app uses plain <img> rather than
  // next/image. Admins can point a plant at any image URL from the admin
  // form, and next/image would reject every host not listed in
  // remotePatterns — so switching would mean a config change (and a
  // redeploy) every time a new image host is used. The images are served
  // straight from /public, and the ones below the fold are lazy-loaded.
};

export default nextConfig;
