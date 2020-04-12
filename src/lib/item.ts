import { renderMarkdown } from "./renderer";
import { cleanse } from "./cleanser";
import { PromiseSequencer } from "./mutex";

const sequencer = new PromiseSequencer();

export async function renderItem() {
  return sequencer.do(async () => {
    const current = await getContent();

    const rendered = renderMarkdown({
      markdown: cleanse(current)
    });

    await setContent(rendered);
  })
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
      coercionType: type
    }, result => {
      if (result.status === Office.AsyncResultStatus.Failed)
        return reject(result.error);

      return resolve();
    });
  });
}