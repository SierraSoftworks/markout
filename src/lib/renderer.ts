import * as inlineCss from "inline-css";
import * as hljs from "highlight.js";
import * as mdit from "markdown-it";

const md: markdownit = mdit({
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                hljs.highlight(lang, str).value
            } catch (__) { }
        }

        return '';
    }
})
    .use(require('markdown-it-footnote'))
    .use(require('markdown-it-emoji'));


export interface RenderOptions {
    markdown: string;
    css: string;
}

export function render({ markdown, css }: RenderOptions): Promise<string> {
    const raw = md.render(markdown);

    return inlineCss(raw, {
        url: ' ',
        extraCss: css,
    });
}

export function renderInline({ markdown, css }: RenderOptions): Promise<string> {
    const raw = md.renderInline(markdown);

    return inlineCss(raw, {
        url: ' ',
        extraCss: css,
    });
}