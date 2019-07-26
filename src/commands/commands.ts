import { toggleRendered, ensureRendered, getContent } from "../lib/item";
import { renderMarkdown } from "../lib/renderer";
import { cleanse } from "../lib/cleanser";

/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */


Office.onReady(info => {
  // If needed, Office.js is ready to be called
});



async function testRenderer(event: Office.AddinCommands.Event) {
  const html = await getContent(Office.CoercionType.Html);
  const text = await getContent(Office.CoercionType.Text);

  console.log({
    before: {
      html,
      text,
    },
    cleansed: {
      html: cleanse(html)
    },
    after: {
      html: renderMarkdown({ markdown: html }),
      text: renderMarkdown({ markdown: text })
    }
  });

  console.log(cleanse(html));

  event.completed();
}

async function renderToggle(event: Office.AddinCommands.Event) {
  try {
    await toggleRendered();
    event.completed();
  } catch (err) {
    console.error(err);
    const message: Office.NotificationMessageDetails = {
      type: Office.MailboxEnums.ItemNotificationMessageType.ErrorMessage,
      message: "Failed to render Markdown in your email",
      icon: "Icon.80x80",
      persistent: true
    }

    Office.context.mailbox.item.notificationMessages.replaceAsync("markout.render", message);
    event.completed({ allowEvent: false });
  }

}

/**
 * Shows a notification when the add-in command is executed.
 * @param event 
 */
async function render(event: Office.AddinCommands.Event) {
  try {
    await ensureRendered();
    event.completed();
  } catch (err) {
    const message: Office.NotificationMessageDetails = {
      type: Office.MailboxEnums.ItemNotificationMessageType.ErrorMessage,
      message: "Failed to render Markdown in your email",
      icon: "Icon.80x80",
      persistent: true
    }

    Office.context.mailbox.item.notificationMessages.replaceAsync("markout.render", message);
    event.completed({ allowEvent: false });
  }

}

function getGlobal() {
  return (typeof self !== "undefined") ? self :
    (typeof window !== "undefined") ? window :
      (typeof global !== "undefined") ? global :
        undefined;
}

const g = getGlobal() as any;

// the add-in command functions need to be available in global scope
g.render = render;
g.renderToggle = renderToggle
g.testRenderer = testRenderer
