import inlineCss from "inline-css";
import hljs from "highlight.js";
import mdit from "markdown-it";
import { getStylesheet } from "./config";



const md: mdit = mdit({
    html: true,
    breaks: false,
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

export const MO_CONTENT_PREFIX = () => `<div class="mo">\n`
export const MO_CONTENT_SUFFIX = () => `</div>\n`

export async function renderMarkdown({ markdown, css }: RenderOptions): Promise<string> {
    css = css || getStylesheet();

    const raw = `${MO_CONTENT_PREFIX()}${md.render(markdown)}${MO_CONTENT_SUFFIX()}`;

    const rendered = await inlineCss(raw, {
        extraCss: css,
        url: " ",
        removeStyleTags: true,
        removeLinkTags: true,
        removeHtmlSelectors: true,
    });

    const dom = new DOMParser().parseFromString(rendered, "text/html");
    return dom.body.innerHTML;
}