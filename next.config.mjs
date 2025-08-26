import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'plus.unsplash.com',
      'pngall.com',
      'www.pngall.com',
      'oatly.com',
      'st.amjadshbib.com',
      'st.amjadshbib.com'

    ],
  },

  productionSourceMaps: false, 

  async redirects() {
    return [
      {
        source: "/favicon.ico",
        destination: "/",
        permanent: false,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
