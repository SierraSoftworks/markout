export function cleanse(text: string): string {
    const container = document.createElement("div");
    container.innerHTML = text;

    const newContainer = cleanseElementContainer(container, false)[0];
    if (newContainer.nodeType === document.TEXT_NODE)
        return newContainer.textContent

    return (<HTMLElement>newContainer).innerHTML
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
        case "div":
        case "span":
            return cleanseElementContainer(el);
        default:
            return [el]
    }
}

function cleanseElementContainer(container: Element, simplifyNode: boolean = true): Node[] {
    // Ignore containers with IDs
    if (container.id)
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
    return (text || "").replace(/^\n*(.+?)\n*$/, "$1")
}

function toArray<T extends Node>(nodes: NodeListOf<T>): T[] {
    const arr = new Array(nodes.length);
    for (let i = 0; i < nodes.length; i++) {
        arr[i] = nodes.item(i)
    }

    return arr
}