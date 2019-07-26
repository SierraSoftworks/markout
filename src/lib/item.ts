import { renderMarkdown } from "./renderer";

const SETTING_STATE = "markout.state"

export interface State {
  preRenderedContent?: string;
  isRendered: boolean;
}

export async function toggleRendered() {
  const state = await getState();

  if (state.isRendered) {
    await setContent(state.preRenderedContent)
    state.preRenderedContent = null;
    state.isRendered = false;
  } else {
    const current = await getContent();

    await setContent(renderMarkdown({
      markdown: current
    }));

    state.preRenderedContent = current;
    state.isRendered = true;
  }

  await setState(state);
}

export async function ensureRendered() {
  const state = await getState()
  if (!state.isRendered)
    await toggleRendered();
}

export async function getState(): Promise<State> {
  const props = await getCustomProperties();

  const state: State = JSON.parse(props.get(SETTING_STATE) || "{}");
  return Object.assign({
    isRendered: false
  }, state);
}

export async function setState(state: State) {
  const props = await getCustomProperties();

  props.set(SETTING_STATE, JSON.stringify(state));
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