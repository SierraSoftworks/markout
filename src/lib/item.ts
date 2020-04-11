import { renderMarkdown } from "./renderer";
import { cleanse } from "./cleanser";
import { PromiseSequencer } from "./mutex";

const SETTING_STATE = "markout.state"

export interface State {
  preRenderedContent?: string;
  isRendered: boolean;
}

const sequencer = new PromiseSequencer();

export async function toggleRendered() {
  return sequencer.do(async () => {
    const state = await getState();

    if (state.isRendered) {
      await unRenderItem(state)
    } else {
      await renderItem(state)
    }
  });
}

export async function renderItem(state?: State) {
  state = state || await getState();

  if (!state.isRendered) {
    const current = await getContent();

    await setContent(renderMarkdown({
      markdown: cleanse(current)
    }));

    state.preRenderedContent = current;
    state.isRendered = true;
    await setState(state);
  }
}

export async function unRenderItem(state?: State) {
  state = state || await getState();

  if (state.isRendered) {
    await setContent(state.preRenderedContent)
    state.preRenderedContent = null;
    state.isRendered = false;
    await setState(state);
  }
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

  return new Promise((resolve, reject) => {
    props.saveAsync(result => {
      if (result.status === Office.AsyncResultStatus.Failed)
        return reject(result.error);
      return resolve();
    });
  });
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