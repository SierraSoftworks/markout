export function cleanse(text: string): string {
    const container = document.createElement("div");
    container.innerHTML = text;

    const newContainer = cleanseElementTree(container);
    if (newContainer.nodeType === document.TEXT_NODE)
        return newContainer.textContent;
    return (<HTMLElement>newContainer).innerHTML
}

function cleanseElementTree(container: Element): Node {
    let replacements = [];

    for (let i = 0; i < container.children.length; i++) {
        const item = container.children.item(i);

        const newItem = cleanseElement(item);
        replacements.push([newItem, item]);
    }

    replacements.forEach(r => container.replaceChild.apply(container, r));

    if (container.childElementCount === 0)
        return document.createTextNode(container.textContent);

    return container
}

function cleanseElement(el: Element): Node {
    switch (el.tagName) {
        case "br":
            return document.createTextNode("\n\n");
        case "span":
            return cleanseElementTree(el);
        case "div":
            const cel = cleanseElementTree(el);

            if (cel.nodeType === document.TEXT_NODE)
                return document.createTextNode(`${cel.textContent}\n\n`);
            return cel;
        default:
            return el;
    }
}