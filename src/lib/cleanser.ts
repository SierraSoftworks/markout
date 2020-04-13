export function cleanse(text: string): string {
    const container = document.createElement("div");
    container.innerHTML = text;

    const newContainer = cleanseElementContainer(container, false)[0];
    if (newContainer.nodeType === document.TEXT_NODE)
        return cleanseText(newContainer.textContent)

    return cleanseHtmlEscapes((<HTMLElement>newContainer).innerHTML)
}

function cleanseNode(node: Node): Node[] {
    switch (node.nodeType) {
        case document.ELEMENT_NODE:
            return cleanseElement(node as Element)
        case document.TEXT_NODE:
            return [document.createTextNode(cleanseText(node.textContent))]
        default:
            return [node]
    }
}

function cleanseElement(el: Element): Node[] {
    switch (el.tagName.toLowerCase()) {
        case "br":
            return [];
        case "a":
            // Flatten automatically generated links
            if (el.innerHTML === el.getAttribute("href"))
                return [document.createTextNode(el.getAttribute("href"))]
            return [el]
        case "img":
            return [el, document.createTextNode("\n")]
        case "div":
        case "span":
            return cleanseElementContainer(el);
        default:
            return [el]
    }
}

function cleanseElementContainer(container: Element, simplifyNode: boolean = true): Node[] {
    // Ignore containers with IDs (except if that ID is an emoji)
    if (container.id && container.id.split("").every(c => c.charCodeAt(0) < 128))
        return [container];

    const newContainer = document.createElement(container.tagName)

    toArray(container.childNodes).forEach(node => {
        cleanseNode(node).forEach(cleansed => {
            if (!isEmpty(cleansed))
                newContainer.appendChild(cleansed)
        })
    })

    if (!simplifyNode) return [newContainer]

    if (toArray(newContainer.childNodes).every(n => n.nodeType === document.TEXT_NODE))
        return [document.createTextNode(cleanseText(newContainer.textContent) + "\n")]

    return toArray(newContainer.childNodes)
}

function isEmpty(node: Node) {
    switch (node.nodeType) {
        case document.TEXT_NODE:
            return !node.textContent
        case document.ELEMENT_NODE:
            const el = (node as Element);
            switch (el.tagName.toLowerCase()) {
                case "img":
                    return false
                default:
                    return !node.childNodes.length
            }
        default:
            return false
    }
}

function cleanseText(text: string): string {
    const container = document.createElement("span")
    container.innerHTML = text;
    return container.textContent.replace(/^\n*(.+?)\n*$/, "$1")
}

function cleanseHtmlEscapes(text: string): string {
    return text.replace(/&[^\s;]+;/g, sequence => {
        const el = document.createElement("span")
        el.innerHTML = sequence
        return el.textContent
    })
}

function toArray<T extends Node>(nodes: NodeListOf<T>): T[] {
    const arr = new Array(nodes.length);
    for (let i = 0; i < nodes.length; i++) {
        arr[i] = nodes.item(i)
    }

    return arr
}