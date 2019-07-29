
export const defaultStylesheet = `
.mo {
  font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
  font-size: 14px;
  color: rgb(36,41,46);
}

.mo pre, .mo code {
  font-size: 0.85em;
  font-family: Consolas, Inconsolata, Courier, monospace;
}

.mo code {
  white-space: normal;
  display: inline;
  color: #B21D12;
}

.mo pre {
  font-size: 1em;
  line-height: 1.2em;
}

.mo pre code {
  white-space: pre;
  overflow: auto;
  border-radius: 1px;
  border: 1px solid #d8d8d8;
  padding: 0.5em 0.7em;
  display: block !important;
  color: #000;
}

.mo p {
  margin: 0 0 1.2em 0 !important;
}

.mo table, .mo pre, .mo dl, .mo blockquote, .mo q, .mo ul, .mo ol {
  margin: 1.2em 0;
}

.mo ul, .mo ol {
  padding-left: 2em;
}

.mo li {
  margin: 0.5em 0;
}

.mo li p {
  margin: 0.5em 0 !important;
}

.mo ul ul, .mo ul ol, .mo ol ul, .mo ol ol {
  margin: 0;
  padding-left: 1em;
}

.mo ol ol, .mo ul ol {
  list-style-type: lower-roman;
}

.mo ul ul ol, .mo ul ol ol, .mo ol ul ol, .mo ol ol ol {
  list-style-type: lower-alpha;
}

.mo dl {
  padding: 0;
}

.mo dl dt {
  font-size: 1em;
  font-weight: bold;
  font-style: italic;
}

.mo dl dd {
  margin: 0 0 1em;
  padding: 0 1em;
}

.mo blockquote, .mo q {
  border-left: 4px solid #DDD;
  padding: 0 1em;
  color: #777;
  quotes: none;
}

.mo blockquote::before, .mo blockquote::after, .mo q::before, .mo q::after {
  content: none;
}

.mo h1, .mo h2, .mo h3, .mo h4, .mo h5, .mo h6 {
  margin: 1.3em 0 1em;
  padding: 0;
  font-weight: bold;
}

.mo h1 {
  font-size: 1.6em;
  border-bottom: 1px solid #ddd;
}

.mo h2 {
  font-size: 1.4em;
  border-bottom: 1px solid #eee;
}

.mo h3 {
  font-size: 1.3em;
}

.mo h4 {
  font-size: 1.2em;
}

.mo h5 {
  font-size: 1em;
}

.mo h6 {
  font-size: 1em;
  color: #777;
}

.mo table {
  padding: 0;
  border-collapse: collapse;
  border-spacing: 0;
  font-size: 1em;
  font: inherit;
  border: 0;
}

.mo tbody {
  margin: 0;
  padding: 0;
  border: 0;
}

.mo table tr {
  border: 0;
  border-top: 1px solid #CCC;
  background-color: white;
  margin: 0;
  padding: 0;
}

.mo table tr:nth-child(2n) {
  background-color: #F8F8F8;
}

.mo table tr th, table tr td {
  font-size: 1em;
  border: 1px solid #CCC;
  margin: 0;
  padding: 0.5em 1em;
}

.mo table tr th {
 font-weight: bold;
  background-color: #F0F0F0;
}

.mo a {
  color: #0366d6;
  text-decoration: none;
}

.mo .hljs {
    display: block;
    font-family: Consolas, Inconsolata, Courier, monospace;
    overflow-x: auto;
    padding: 0.5em;
    color: black
}

.mo .hljs-variable,.hljs-template-variable,.hljs-symbol,.hljs-bullet,.hljs-section,.hljs-addition,.hljs-attribute,.hljs-link {
    color: #333
}

.mo .hljs-string {
    color: #B21D12;
}

.mo .hljs-comment,.hljs-quote,.hljs-meta,.hljs-deletion {
    color: #ccc
}

.mo .hljs-keyword,.hljs-selector-tag,.hljs-section,.hljs-name,.hljs-type,.hljs-strong,.hljs-attr {
    font-weight: bold
}

.mo .hljs-literal,.hljs-number {
    color: #409EFF;
    font-weight: bold;
}

.mo .hljs-emphasis {
    font-style: italic
}
`;

const SETTING_STYLESHEET = "markout.stylesheet";

export function getStylesheet(): string {
  return Office.context.roamingSettings.get(SETTING_STYLESHEET) || defaultStylesheet;
}

export function setStylesheet(style: string) {
  Office.context.roamingSettings.set(SETTING_STYLESHEET, style);
}

export function saveStylesheet(style?: string): Promise<string> {
  style && setStylesheet(style);
  return new Promise((resolve, reject) => {
    Office.context.roamingSettings.saveAsync(state => {
      if (state.status === Office.AsyncResultStatus.Failed) {
        const err = new Error(state.error.message);
        err.name = state.error.name;
        return reject(err);
      }

      return resolve();
    });
  });
}