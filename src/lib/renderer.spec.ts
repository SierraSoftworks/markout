import { renderMarkdown } from "./renderer"
import { expect } from "chai";

describe("renderer", () => {
    it("should generate HTML for basic markdown", () => {
        const input = `# Example\nThis is a test`
        const expected = `<div class="mo" id="mo-content-000000">\n<h1>Example</h1>\n<p>This is a test</p>\n</div>\n`
        const output = renderMarkdown({ markdown: input, css: "html {}" }).replace(/mo-content-\d{1,6}/g, "mo-content-000000")

        expect(output).to.be.equal(expected)
    })

    it("should render elements when there is HTML present", () => {
        const input = `# Example\nThis is a test with HTML elements\n<img src="http://example.com/img.png">`
        const expected = `<div class="mo" id="mo-content-000000">\n<h1>Example</h1>\n<p>This is a test with HTML elements\n<img src="http://example.com/img.png"></p>\n</div>\n`
        const output = renderMarkdown({ markdown: input, css: "html {}" }).replace(/mo-content-\d{1,6}/g, "mo-content-000000")

        expect(output).to.be.equal(expected)
    })
})