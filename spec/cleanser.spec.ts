import { cleanse } from "../src/lib/cleanser";
import { JSDOM } from "jsdom"

const dom = new JSDOM()

global["window"] = dom.window
global["document"] = dom.window.document

function p(input: string): string {
    return `<div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">${input}</div>`
}

describe("cleanser", function () {
    it("should handle a simple line correctly", () => {
        const input = `${p('this is a simple line')}`;
        const expected = `this is a simple line`
        const output = cleanse(input)

        expect(output).toBe(expected)
    })

    it("should handle line breaks correctly", () => {
        const input = `${p('p1')}${p('<br/>')}${p('p2')}${p('<br/>')}${p('p3')}`;
        const expected = `p1\np2\np3`
        const output = cleanse(input)

        expect(output).toBe(expected)
    })

    it("should convert a complex example correctly", () => {
        const input = `<div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);"># Example<br></div>
<div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);"><br></div>
<div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">This is an **example** with some \`source code\` 😉.</div>
<div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">We've also got some multi-line paragraphs.</div>
<div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);"><br></div>
<div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">And some true paragraphs.</div>
<div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);"><br></div>
<div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">\`\`\`json</div>
<div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">{ "withCodeBlocks": true }<br></div>
<div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">\`\`\`</div>
<div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);"><br></div>
<div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">&gt; Awesome!<br></div>`.replace("\n", "")

        const expected = [
            "# Example",
            "",
            "This is an **example** with some `source code` 😉.",
            "We've also got some multi-line paragraphs.",
            "",
            "",
            "And some true paragraphs.",
            "",
            "",
            "```json",
            `{ "withCodeBlocks": true }`,
            "```",
            "",
            "",
            "> Awesome!"
        ]
        const output = cleanse(input)

        expect(output.split("\n")).toEqual(expected)
    })
})