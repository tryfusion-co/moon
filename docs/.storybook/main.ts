import type { StorybookConfig } from 'storybook-solidjs-vite';
import path from 'path';

const getAbsolutePath = (packageName: string): string =>
  path.dirname(import.meta.resolve(`${packageName}/package.json`)).replace(/^file:\/\//, '');

const config: StorybookConfig = {
  stories: [
    '../stories/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../stories/*.mdx',
  ],
  staticDirs: ['../stories/assets'],
  addons: [
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-a11y'),
    {
      name: getAbsolutePath('@storybook/addon-vitest'),
      options: { cli: false },
    },
    getAbsolutePath('@storybook/addon-themes'),
  ],
  framework: {
    name: 'storybook-solidjs-vite',
    options: {
      docgen: {
        savePropValueAsString: true,
        shouldExtractLiteralValuesFromEnum: true,
        propFilter: (prop: any) =>
          prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
      },
    },
  },
  managerHead: (head) => `
 <!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-6L8W2YTV0W"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-6L8W2YTV0W');
</script>
  <link rel="icon" href="https://assets.moon.io/symbols/product/moon.png" type="image/png">
    ${head}
    <style>.sidebar-header img {height: 24px}</style>
  `,
};

export default config;
