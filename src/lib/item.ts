import { renderMarkdown } from "./renderer";
import { cleanse } from "./cleanser";

export async function renderItem() {
  const [current, customProperties] = await Promise.all([
    getContent(Office.CoercionType.Html),
    getCustomProperties()
  ]);

  const originalContent = getRenderState(customProperties)
  if (originalContent) {
    await Promise.all([
      updateRenderState(customProperties, null),
      setContent(cleanse(current), Office.CoercionType.Html),
    ])
  } else {
    const rendered = await renderMarkdown({
      markdown: cleanse(current)
    });

    await Promise.all([
      updateRenderState(customProperties, current),
      setContent(rendered, Office.CoercionType.Html),
    ]);
  }
}

export async function ensureRendered() {
  const [current, customProperties] = await Promise.all([
    getContent(Office.CoercionType.Html),
    getCustomProperties()
  ]);

  const originalContent = getRenderState(customProperties)
  if (originalContent) {
    return;
  } else {
    const rendered = await renderMarkdown({
      markdown: cleanse(current)
    });

    await Promise.all([
      updateRenderState(customProperties, current),
      setContent(rendered, Office.CoercionType.Html),
    ]);
  }
}

export async function updateRenderState(customProperties: Office.CustomProperties, original: string): Promise<void> {
  if (original)
    customProperties.set("mo-original", "false")
  else
    customProperties.remove("mo-original")

  return await new Promise((resolve, reject) => {
    customProperties.saveAsync(result => {
      if (result.status === Office.AsyncResultStatus.Failed) {
        return reject(result.error)
      }

      return resolve()
    })
  })
}

export function getRenderState(customProperties: Office.CustomProperties): string {
  return customProperties.get("mo-original")
}

export function getCustomProperties(): Promise<Office.CustomProperties> {
  return new Promise((resolve, reject) => {
    Office.context.mailbox.item.loadCustomPropertiesAsync(result => {
      if (result.status === Office.AsyncResultStatus.Failed)
        return reject(result.error);

      resolve(result.value);
    });
  });
}

export async function getContent(type: Office.CoercionType = Office.CoercionType.Html): Promise<string> {
  return await new Promise((resolve, reject) => {
    Office.context.mailbox.item.body.getAsync(
      type,
      result => {
        if (result.status === Office.AsyncResultStatus.Failed)
          return reject(result.error);

        return resolve(result.value);
      });
  });
}

export function setContent(value: string, type: Office.CoercionType = Office.CoercionType.Html): Promise<void> {
  return new Promise((resolve, reject) => {
    Office.context.mailbox.item.body.setAsync(value, {
      coercionType: type,
    }, result => {
      if (result.status === Office.AsyncResultStatus.Failed)
        return reject(result.error);

      return resolve();
    });
  });
}