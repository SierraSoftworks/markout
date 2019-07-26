import { renderMarkdown } from "../lib/renderer";
import { getStylesheet, saveStylesheet, setStylesheet } from "../lib/style";
import { Debounce } from "../lib/debounce";

/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

Office.onReady(info => {
  if (info.host === Office.HostType.Outlook) {
    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";

    (document.getElementById("mo-theme") as HTMLTextAreaElement).value = getStylesheet();

    document.getElementById("mo-theme").onchange = updateStylesheet;
    document.getElementById("mo-theme").onkeyup = updateStylesheet;
    updateRender()
  }
});

const example = `
## MarkOut
Write your emails in *Markdown* with no fuss. Make your
content **pop** or show some \`code\`.

\`\`\`js
console.log("Hello world!");
\`\`\`

`.trim();

const debounce = new Debounce(() => {
  saveStylesheet().then(() => {
    document.getElementById("mo-changes-saved").style.opacity = "1";
  }, err => {
    document.getElementById("mo-changes-lost").style.opacity = "1";
  });
}, 2000)

export async function updateStylesheet() {
  const newStyle = (document.getElementById("mo-theme") as HTMLTextAreaElement).value
  setStylesheet(newStyle);
  await updateRender();

  document.getElementById("mo-changes-saved").style.opacity = "0";
  document.getElementById("mo-changes-lost").style.opacity = "0";
  debounce.trigger();
}

export async function updateRender() {
  document.getElementById("mo-preview").innerHTML = renderMarkdown({
    markdown: example
  });
}
