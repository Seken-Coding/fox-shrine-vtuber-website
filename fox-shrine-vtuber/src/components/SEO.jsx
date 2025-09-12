import React from 'react';
import { Helmet } from 'react-helmet';

const SEO = ({ title, description, image, url, type = 'website' }) => {
  const siteTitle = 'Fox Shrine VTuber';
  const defaultDescription = 'Join the Fox Shrine for games, laughs, and shrine fox adventures!';
  const defaultImage = 'https://foxshrinevtuber.com/social-card.jpg';
  const siteUrl = 'https://foxshrinevtuber.com';
  
  const seo = {
    title: title ? `${title} | ${siteTitle}` : siteTitle,
    description: description || defaultDescription,
    image: `${image || defaultImage}`,
    url: `${url || siteUrl}`,
  };
  
  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="image" content={seo.image} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={seo.url} />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
      
      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
    </Helmet>
  );
};

export default SEO;