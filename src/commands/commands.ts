import { renderItem } from "../lib/item";
import { getAutoRender } from "../lib/config";

/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */


Office.onReady(info => {
  // If needed, Office.js is ready to be called
});

/**
 * Shows a notification when the add-in command is executed.
 * @param event 
 */
async function render(event: Office.AddinCommands.Event) {
  try {
    await renderItem();
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

async function onSend(event: Office.AddinCommands.Event) {
  if (!getAutoRender()) return;

  try {
    await renderItem();
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
g.onSend = onSend;