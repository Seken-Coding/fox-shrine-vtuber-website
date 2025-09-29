import React from 'react';
import { render, waitFor } from '@testing-library/react';
import SEO from './SEO';

describe('SEO', () => {
  test('sets document title and meta tags', async () => {
    const title = 'Test Page';
    const description = 'A description';
    const image = 'https://example.com/image.jpg';
    const url = 'https://example.com/page';

    render(<SEO title={title} description={description} image={image} url={url} />);

    await waitFor(() => expect(document.title).toMatch(/Test Page/));

    await waitFor(() => {
      const desc = document.head.querySelector('meta[name="description"]');
      expect(desc).toBeTruthy();
      expect(desc.getAttribute('content')).toBe(description);
    });

    await waitFor(() => {
      const ogTitle = document.head.querySelector('meta[property="og:title"]');
      expect(ogTitle).toBeTruthy();
      expect(ogTitle.getAttribute('content')).toMatch(/Test Page/);
    });

    await waitFor(() => {
      const twitterCard = document.head.querySelector('meta[name="twitter:card"]');
      expect(twitterCard).toBeTruthy();
      expect(twitterCard.getAttribute('content')).toBe('summary_large_image');
    });
  });
});
