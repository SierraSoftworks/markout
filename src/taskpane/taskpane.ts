import { renderMarkdown } from "../lib/renderer";
import { getStylesheet, saveStylesheet, setStylesheet, getAutoRender, setAutoRender } from "../lib/config";
import { Debounce } from "../lib/debounce";
import { renderItem } from "../lib/item";

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

    const renderButton = document.getElementById("mo-render");
    const renderButtonText = document.getElementById("mo-render__text");
    const updateRenderButton = () => {
      renderButtonText.removeAttribute("disabled")
    }

    const autoRenderButton = document.getElementById("mo-autorender");
    const autoRenderButtonText = document.getElementById("mo-autorender__text");
    const autoRenderButtonIcon = document.getElementById("mo-autorender__icon");
    const updateAutoRenderButton = (enabled: boolean) => {
      if (enabled) {
        autoRenderButtonText.innerText = "Auto Render On"
        autoRenderButtonIcon.setAttribute("class", "ms-Icon ms-Icon--InboxCheck")
      } else {
        autoRenderButtonText.innerText = "Auto Render Off"
        autoRenderButtonIcon.setAttribute("class", "ms-Icon ms-Icon--Inbox")
      }
    }


    renderButton.onclick = () => {
      renderButton.setAttribute("disabled", "disabled");
      renderItem().then(updateRenderButton);

      return false;
    };

    autoRenderButton.onclick = () => {
      setAutoRender(!getAutoRender()).then(updateAutoRenderButton)

      return false;
    };

    updateRenderButton();
    updateAutoRenderButton(getAutoRender());
  }
});

const example = `
## Example
Write your emails in *Markdown* with no fuss. Make your
content **pop** or show some \`code\`.

\`\`\`js
console.log("Hello world!");
\`\`\`

:warning: You can use \`Ctrl+Z\` to undo rendering.

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
