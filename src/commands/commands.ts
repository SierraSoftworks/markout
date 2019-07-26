import { MO_CONTENT_PREFIX, MO_CONTENT_SUFFIX, renderMarkdown } from "../lib/renderer";

/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

Office.onReady(info => {
  // If needed, Office.js is ready to be called


});

const SETTING_ORIGINAL_MARKDOWN = "markout.state.markdown"

function getCustomProperties(): Promise<Office.CustomProperties> {
  return new Promise((resolve, reject) => {
    Office.context.mailbox.item.loadCustomPropertiesAsync(result => {
      if (result.status === Office.AsyncResultStatus.Failed)
        return reject(result.error);

      resolve(result.value);
    });
  });
}

async function getContent(): Promise<{
  content: string;
  type: Office.CoercionType;
}> {
  const customProperties = await getCustomProperties();
  return await new Promise((resolve, reject) => {
    const coercionType = customProperties.get(SETTING_ORIGINAL_MARKDOWN) ? Office.CoercionType.Html : Office.CoercionType.Text;
    Office.context.mailbox.item.body.getAsync(
      coercionType,
      result => {
        if (result.status === Office.AsyncResultStatus.Failed)
          return reject(result.error);

        return resolve({
          content: result.value,
          type: coercionType
        });
      });
  });
}

function setContent(type: Office.CoercionType, value: string): Promise<void> {
  return new Promise((resolve, reject) => {
    Office.context.mailbox.item.body.setAsync(value, {
      coercionType: type
    }, result => {
      if (result.status === Office.AsyncResultStatus.Failed)
        return reject(result.error);

      return resolve();
    });
  });
}

async function renderToggle(event: Office.AddinCommands.Event) {
  try {
    const customProperties = await getCustomProperties();
    const content = await getContent();

    console.log(content)

    if (content.type === Office.CoercionType.Html) {
      await setContent(Office.CoercionType.Text, customProperties.get(SETTING_ORIGINAL_MARKDOWN));
      customProperties.set(SETTING_ORIGINAL_MARKDOWN, "");
    } else {
      customProperties.set(SETTING_ORIGINAL_MARKDOWN, content.content);
      await setContent(Office.CoercionType.Html, renderMarkdown({
        markdown: content.content
      }));
    }
  } catch (err) {
    console.error(err);
    const message: Office.NotificationMessageDetails = {
      type: Office.MailboxEnums.ItemNotificationMessageType.ErrorMessage,
      message: "Failed to modify content",
      icon: "Icon.80x80",
      persistent: true
    }

    Office.context.mailbox.item.notificationMessages.replaceAsync("markout.render", message);
  }

  event.completed();
}

/**
 * Shows a notification when the add-in command is executed.
 * @param event 
 */
async function render(event: Office.AddinCommands.Event) {
  try {
    const customProperties = await getCustomProperties();
    const content = await getContent()

    if (content.type === Office.CoercionType.Html) {
      // This is all okay
    } else {
      await setContent(Office.CoercionType.Html, renderMarkdown({
        markdown: content.content
      }));
    }
  } catch (err) {
    console.error(err);
    const message: Office.NotificationMessageDetails = {
      type: Office.MailboxEnums.ItemNotificationMessageType.ErrorMessage,
      message: "Failed to modify content",
      icon: "Icon.80x80",
      persistent: true
    }

    Office.context.mailbox.item.notificationMessages.replaceAsync("markout.render", message);
  }

  event.completed();
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
