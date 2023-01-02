import { renderMarkdown } from "../src/lib/renderer"
import { expect } from "chai";
import { JSDOM } from "jsdom"

const jsdom = new JSDOM()
global["DOMParser"] = jsdom.window.DOMParser;

describe("renderer", () => {
    it("should generate HTML for basic markdown", async () => {
        const input = `# Example\nThis is a test`
        const expected = `<div class="mo">\n<h1>Example</h1>\n<p>This is a test</p>\n</div>\n`
        const output = await renderMarkdown({ markdown: input, css: "html {}" })

        expect(output).to.be.equal(expected)
    })

    it("should render elements when there is HTML present", async () => {
        const input = `# Example\nThis is a test with HTML elements\n<img src="http://example.com/img.png">`
        const expected = `<div class="mo">\n<h1>Example</h1>\n<p>This is a test with HTML elements\n<img src="http://example.com/img.png"></p>\n</div>\n`
        const output = await renderMarkdown({ markdown: input, css: "html {}" })

        expect(output).to.be.equal(expected)
    })
})