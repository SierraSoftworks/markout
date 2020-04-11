export function cleanse(text: string): string {
    const container = document.createElement("div");
    container.innerHTML = text;

    const newContainer = cleanseElement(container);
    return cleanseText(newContainer.nodeValue)
}

function cleanseElementTree(container: Element): Node {
    const replacements: {
        old: Node;
        new: Node;
    }[] = [];

    for (let i = 0; i < container.children.length; i++) {
        const item = container.children.item(i);

        replacements.push({ old: item, new: cleanseElement(item) });
    }

    replacements.forEach(r => container.replaceChild(r.new, r.old));

    if (container.childElementCount === 0)
        return document.createTextNode(cleanseText(container.textContent));

    return container
}

function cleanseElement(el: Element): Node {
    switch (el.tagName) {
        case "BR":
            return document.createTextNode("\n");
        case "SPAN":
            return cleanseElementTree(el);
        case "DIV":
            if (el.id) return el;

            return cleanseElementTree(el);
        default:
            return cleanseElementTree(el);
    }
}

function cleanseText(text: string): string {
    return (text || "").replace(/^\n*(.+?)\n*$/, "$1")
}