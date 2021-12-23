import { renderMarkdown } from "../lib/renderer";
import { getContent } from "../lib/item";
import { cleanse } from "../lib/cleanser";

/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

Office.onReady(info => {
  if (info.host === Office.HostType.Outlook) {
    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";

    const rawInput = (document.getElementById("mo-raw-in") as HTMLTextAreaElement);
    const cleansedInput = (document.getElementById("mo-cleansed-in") as HTMLTextAreaElement);
    const rawOutput = (document.getElementById("mo-raw-out") as HTMLTextAreaElement);
    const rawOutputRendered = (document.getElementById("mo-raw-out-rendered") as HTMLDivElement);

    const refreshButton = document.getElementById("mo-refresh");
    refreshButton.onclick = () => {
      refreshDebug()
      return false;
    };

    const refreshDebug = () => {
      getContent(Office.CoercionType.Html).then(content => {
        rawInput.value = content;
        const cleansed = cleanse(content)
        cleansedInput.value = cleansed;

        return renderMarkdown({ markdown: cleansed });
      }).then(html => {
        rawOutput.value = html;
        rawOutputRendered.innerHTML = html;
      }).catch(err => {
        rawOutput.value = `ERROR: ${err}\n${err.stack}`;
      })
    }

    refreshDebug()
  }
});