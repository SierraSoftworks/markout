export function cleanse(text: string): string {
    const dom = new DOMParser().parseFromString(`${text}`, "text/html")
    
    const newDom = dom.createElement("pre");
    forEach(dom.body.childNodes, node => {
        newDom.append(...cleanseNode(dom, node))
    })

    return cleanseHtmlEscapes(dom, (<HTMLElement>newDom).innerHTML)
}

function cleanseNode(dom: Document, node: Node): Node[] {
    switch (node.nodeType) {
        case dom.ELEMENT_NODE:
            return cleanseElement(dom, node as Element)
        case dom.TEXT_NODE:
            return [dom.createTextNode(cleanseText(dom, node.textContent))]
        default:
            return [node]
    }
}

function cleanseElement(dom: Document, el: Element): Node[] {
    switch (el.tagName.toLowerCase()) {
        case "script":
            return []
        case "br":
            return [];
        case "a":
            // Flatten automatically generated links
            if (el.innerHTML === el.getAttribute("href"))
                return [dom.createTextNode(el.getAttribute("href"))]
            return [el]
        case "img":
            return [el, dom.createTextNode("\n")]
        case "div":
        case "span":
            return cleanseElementContainer(dom, el);
        default:
            return [el]
    }
}

function cleanseElementContainer(dom: Document, container: Element, simplifyNode: boolean = true): Node[] {
    // Ignore containers with IDs (except if that ID is an emoji)
    if (container.id && container.id.split("").every(c => c.charCodeAt(0) < 128))
        return [container];

    const newContainer = dom.createElement(container.tagName)

    toArray(container.childNodes).forEach(node => {
        cleanseNode(dom, node).forEach(cleansed => {
            if (!isEmpty(dom, cleansed))
                newContainer.appendChild(cleansed)
        })
    })

    if (!simplifyNode) return [newContainer]

    if (toArray(newContainer.childNodes).every(n => n.nodeType === dom.TEXT_NODE))
        return [dom.createTextNode(cleanseText(dom, newContainer.textContent) + "\n")]

    return toArray(newContainer.childNodes)
}

function isEmpty(dom: Document, node: Node) {
    switch (node.nodeType) {
        case dom.TEXT_NODE:
            return !node.textContent
        case dom.ELEMENT_NODE:
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

function cleanseText(dom: Document, text: string): string {
    const container = dom.createElement("span")
    container.innerHTML = text;
    return container.textContent.replace(/^\n*(.+?)\n*$/, "$1")
}

function cleanseHtmlEscapes(dom: Document, text: string): string {
    return text.replace(/&[^\s;]+;/g, sequence => {
        const el = dom.createElement("span")
        el.innerHTML = sequence
        return el.textContent
    })
}

interface Collection<T> {
    length: number;
    item(index: number): T;
}

function forEach<T extends Node>(nodes: Collection<T>, apply: (el: T, i: number) => void) {
    for (let i = 0; i < nodes.length; i++) {
        apply(nodes.item(i), i)
    }
}

function map<T extends Node, O>(nodes: Collection<T>, mutate: (el: T, i: number) => O): O[] {
    const items: O[] = new Array(nodes.length)
    forEach(nodes, (el, i) => items[i] = mutate(el, i))

    return items
}

function toArray<T extends Node>(nodes: NodeListOf<T>): T[] {
    const arr = new Array(nodes.length);
    for (let i = 0; i < nodes.length; i++) {
        arr[i] = nodes.item(i)
    }

    return arr
}