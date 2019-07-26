import * as juice from "juice";
import * as hljs from "highlight.js";
import * as mdit from "markdown-it";
import { getStylesheet } from "./style";

const md: markdownit = mdit({
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return `<pre class="hljs"><code>${hljs.highlight(lang, str).value}</code></pre>`;
            } catch (__) { }
        }

        return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
    }
})
    .use(require('markdown-it-footnote'))
    .use(require('markdown-it-emoji'));


export interface RenderOptions {
    markdown: string;
    css?: string;
}

export const MO_CONTENT_PREFIX = `<div class="mo" data-mo="start">`
export const MO_CONTENT_SUFFIX = `<span data-mo="end"></span></div>`

export function renderMarkdown({ markdown, css }: RenderOptions): string {
    css = css || getStylesheet();

    const raw = `${MO_CONTENT_PREFIX}${md.render(markdown)}${MO_CONTENT_SUFFIX}`;

    return juice(raw, {
        extraCss: css,
    });
}

// export function renderEmail({ markdown, css }: RenderOptions): string {
//     css = css || getStylesheet();

//     const markdownText = markdown.split
// }