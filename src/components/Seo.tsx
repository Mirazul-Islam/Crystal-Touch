import { Helmet } from 'react-helmet-async';

interface SeoProps {
  title: string;
  description?: string;
  path?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown>;
}

const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined) ||
  'https://crystaltouch.example.com';

export function Seo({ title, description, path = '', noindex, jsonLd }: SeoProps) {
  const fullTitle = title.includes('Crystal Touch')
    ? title
    : `${title} | Crystal Touch Cleaning`;
  const url = `${SITE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={url} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
