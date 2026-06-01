import {
  DocsContainer,
  DocsContextProps,
  DocsPage,
} from '@storybook/addon-docs/blocks';
import { Renderer } from 'storybook/internal/types';
import { getMoonLink, getGithubLink } from '../utils/component-links';

type Props = {
  context: DocsContextProps<Renderer>;
  component: string;
};

const LinksBlock = (props: Props) => (
  <DocsContainer context={props.context}>
    <div class="sb-unstyled flex flex-col sm:flex-row gap-space-12 mb-space-40">
      <a
        href={`https://moondesignsystem.com/docs/components/${getMoonLink(
          props.component
        )}`}
        target="_blank"
        class="overflow-hidden flex items-center border border-primary rounded-4 h-space-48"
      >
        <div class="flex items-center justify-center h-full aspect-square bg-tertiary">
          <img src="/logo.png" alt="Website" class="w-space-40" />
        </div>
        <div class="flex flex-col px-space-8">
          <span class="text-md font-medium">View component</span>
          <span class="text-sm text-secondary">Moon Design System</span>
        </div>
      </a>
      <a
        href="https://www.npmjs.com/package/@moondesignsystem/solid"
        target="_blank"
        class="overflow-hidden flex items-center border border-primary rounded-4 h-space-48"
      >
        <div class="flex items-center justify-center h-full aspect-square bg-tertiary">
          <img src="/npm.png" alt="NPM" class="w-space-40" />
        </div>
        <div class="flex flex-col px-space-8">
          <span class="text-md font-medium">View package</span>
          <span class="text-sm text-secondary">NPM</span>
        </div>
      </a>
      <a
        href={`https://github.com/moondesignsystem/react/blob/main/packages/src/components/${getGithubLink(
          props.component
        )}`}
        target="_blank"
        class="overflow-hidden flex items-center border border-primary rounded-4 h-space-48"
      >
        <div class="flex items-center justify-center h-full aspect-square bg-tertiary">
          <img src="/github.png" alt="GitHub" class="w-space-40" />
        </div>
        <div class="flex flex-col px-space-8">
          <span class="text-md font-medium">View component</span>
          <span class="text-sm text-secondary">GitHub</span>
        </div>
      </a>
    </div>
    <DocsPage />
  </DocsContainer>
);

export default LinksBlock;
