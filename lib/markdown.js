import MarkdownIt from 'markdown-it';

const markdown = new MarkdownIt({ html: false, linkify: true });
markdown.renderer.rules.image = (tokens, index, options, env, self) => {
  tokens[index].attrSet('loading', 'lazy');
  tokens[index].attrSet('decoding', 'async');
  const image = tokens[index].attrGet('src');
  if (!image.startsWith('/') || image.startsWith('//')) {
    tokens[index].attrSet('referrerpolicy', 'no-referrer');
  }
  const token = tokens[index];
  token.attrSet('alt', self.renderInlineAsText(token.children, options, env));
  return self.renderToken(tokens, index, options);
};

export function renderMarkdown(source) {
  return markdown.render(source);
}

export function imageNames(source) {
  return markdown.parse(source, {}).flatMap((token) =>
    (token.children ?? []).filter(({ type }) => type === 'image')
      .map((image) => image.attrGet('src'))
      .filter((url) => url.startsWith('/blog-image/'))
      .map((url) => url.slice('/blog-image/'.length))
  );
}
