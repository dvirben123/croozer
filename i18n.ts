import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  // Default to Hebrew
  const locale = 'he';

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});

