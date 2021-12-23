export function cleanse(text: string): string {
    const dom = new DOMParser().parseFromString(`${text}`, "text/html")
    
    const lines = [].concat(...toArray(dom.body.childNodes).map(node => cleanseNode(dom, node)))

    return lines.join("").trim()
}

function cleanseNode(dom: Document, node: Node): string[] {
    switch (node.nodeType) {
        case dom.ELEMENT_NODE:
            return cleanseElement(dom, node as Element)
        case dom.TEXT_NODE:
            return [cleanseText(dom, node.textContent)]
        default:
            return [node.textContent]
    }
}

function cleanseElement(dom: Document, el: Element): string[] {
    switch (el.tagName.toLowerCase()) {
        case "script":
            return []
        case "br":
            return [];
        case "a":
            // Flatten automatically generated links
            if (el.innerHTML === el.getAttribute("href"))
                return [el.getAttribute("href")]
            return [el.outerHTML]
        case "img":
            return [el.outerHTML.replace(/\n+/g, '\n')]
        case "div":
        case "p":
            return [...cleanseElementContainer(dom, el), "\n"]
        case "span":
            return cleanseElementContainer(dom, el);
        default:
            return [el.outerHTML]
    }
}

function cleanseElementContainer(dom: Document, container: Element): string[] {
    // Ignore containers with IDs (except if that ID is an emoji)
    if (container.id && container.id.split("").every(c => c.charCodeAt(0) < 128))
        return [container.outerHTML];

    return [].concat(...toArray(container.childNodes).map(node => cleanseNode(dom, node)))
}

function cleanseText(dom: Document, text: string): string {
    const container = dom.createElement("span");
    container.innerHTML = text.replace(/[\u007F-\u009F]/g, "").replace(/[\u00a0]/g, " ");
    if (!container.innerHTML.trim()) return ""

    return container.textContent
        .replace(/^(\r?\n)+/, "\n")
        .replace(/(\r?\n)+$/, "\n")
        .replace(/(.+)[\r\n]+(.+)/g, "$1 $2")
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