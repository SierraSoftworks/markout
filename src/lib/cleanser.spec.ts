import { cleanse } from "./cleanser";
import { expect } from "chai";
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
        const expected = `this is a simple line\n`
        const output = cleanse(input)

        expect(output).to.be.equal(expected)
    })

    it("should handle escaped HTML characters correctly", () => {
        const input = `${p('&gt; Quoted')}`;
        const expected = `&gt; Quoted\n`
        const output = cleanse(input)

        expect(output).to.be.equal(expected)
    })

    it("should handle line breaks correctly", () => {
        const input = `${p('p1')}${p('<br/>')}${p('p2')}${p('<br/>')}${p('p3')}`;
        const expected = `p1\n\np2\n\np3\n`
        const output = cleanse(input)

        expect(output).to.be.equal(expected)
    })

    it("should convert a complex example correctly", () => {
        const input = `<div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);"><span># Example</span></div><div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);"><span><br></span></div><div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);"><span>This is an **example** with some \`source code\` 😉.</span></div><div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);"><span>We've also got some multi-line paragraphs.</span></div><div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);"><span><br></span></div><div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);"><span>And some true paragraphs.</span></div><div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);"><span><br></span></div><div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);"><span>\`\`\`json</span></div><div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);"><span>{ "withCodeBlocks": true }</span></div><div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);"><span>\`\`\`</span></div><div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);"><span><br></span></div><div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);"><span>&gt; Awesome!</span><br></div>`

        const expected = [
            "# Example",
            "",
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
            "&gt; Awesome!",
            ""
        ]
        const output = cleanse(input)

        expect(output.split("\n")).to.eql(expected)
    })

    it("should support image tags", () => {
        const input = `<div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">Test</div><div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);"><img originalsrc="cid:18baea5f-c601-4657-a0b0-b53ba36c5059" size="11236937" contenttype="image/png" style="max-width: 100%; user-select: none;" crossorigin="use-credentials" src="https://attachments.office.net/owa/test%40example.com/service.svc/s/GetAttachmentThumbnail?id=AAMkADLTY2NDgtNDAzYS0" unselectable="on" tabindex="-1"><br></div>`;
        const expected = [
            "Test",
            `<img originalsrc="cid:18baea5f-c601-4657-a0b0-b53ba36c5059" size="11236937" contenttype="image/png" style="max-width: 100%; user-select: none;" crossorigin="use-credentials" src="https://attachments.office.net/owa/test%40example.com/service.svc/s/GetAttachmentThumbnail?id=AAMkADLTY2NDgtNDAzYS0" unselectable="on" tabindex="-1">`,
            ""
        ]

        const output = cleanse(input)

        expect(output.split("\n")).to.eql(expected)
    })

    it("should ignore items with IDs", () => {
        const input = `<div><div id="mo-content-123456"># Example</div></div>`
        const expected = [
            `<div id="mo-content-123456"># Example</div>`
        ]

        const output = cleanse(input)

        expect(output.split("\n")).to.eql(expected)
    })

    it("should cleanse a broken complex example correctly", () => {
        const input = `<div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);"><div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt"><div><div><span><div style="font-family:Calibri,Arial,Helvetica,sans-serif; color:rgb(0,0,0)">
# Example<br></div><div style="font-family:Calibri,Arial,Helvetica,sans-serif; color:rgb(0,0,0)"><br></div><div style="font-family:Calibri,Arial,Helvetica,sans-serif; color:rgb(0,0,0)">
This is an **example** with some \`source code\` 😉.</div><div style="font-family:Calibri,Arial,Helvetica,sans-serif; color:rgb(0,0,0)">
We've also got some multi-line paragraphs.</div><div style="font-family:Calibri,Arial,Helvetica,sans-serif; color:rgb(0,0,0)"><br></div><div style="font-family:Calibri,Arial,Helvetica,sans-serif; color:rgb(0,0,0)">
And some true paragraphs.</div><div style="font-family:Calibri,Arial,Helvetica,sans-serif; color:rgb(0,0,0)"><br></div><div style="font-family:Calibri,Arial,Helvetica,sans-serif; color:rgb(0,0,0)">
\`\`\`json</div><div style="font-family:Calibri,Arial,Helvetica,sans-serif; color:rgb(0,0,0)">
{ "withCodeBlocks": true }<br></div><div style="font-family:Calibri,Arial,Helvetica,sans-serif; color:rgb(0,0,0)">
\`\`\`</div><div style="font-family:Calibri,Arial,Helvetica,sans-serif; color:rgb(0,0,0)"><br></div><div style="font-family:Calibri,Arial,Helvetica,sans-serif; color:rgb(0,0,0)">
&gt; Awesome!</div><div style="font-family:Calibri,Arial,Helvetica,sans-serif; color:rgb(0,0,0)"><br></div><div style="font-family:Calibri,Arial,Helvetica,sans-serif; color:rgb(0,0,0)"></div></span><img originalsrc="cid:18baea5f-c601-4657-a0b0-b53ba36c5059" size="11236937" contenttype="image/png" style="max-width: 100%; user-select: none;" crossorigin="use-credentials" src="https://attachments.office.net/owa/test%40example.com/service.svc/s/GetAttachmentThumbnail?id=AAMkADLTY2NDgtNDAzYS0" unselectable="on" tabindex="-1"><br></div>`

        const expected = [
            "# Example",
            "",
            "This is an **example** with some `source code` 😉.",
            "We've also got some multi-line paragraphs.",
            "",
            "And some true paragraphs.",
            "",
            "```json",
            `{ "withCodeBlocks": true }`,
            "```",
            "",
            "&gt; Awesome!",
            "",
            "",
            "",
            `<img originalsrc="cid:18baea5f-c601-4657-a0b0-b53ba36c5059" size="11236937" contenttype="image/png" style="max-width: 100%; user-select: none;" crossorigin="use-credentials" src="https://attachments.office.net/owa/test%40example.com/service.svc/s/GetAttachmentThumbnail?id=AAMkADLTY2NDgtNDAzYS0" unselectable="on" tabindex="-1">`,
            ""
        ]

        const output = cleanse(input)

        expect(output.split("\n")).to.eql(expected)
    })

    it("should handle auto-linked content correctly", () => {
        const input = `[example]: <a id="AAAAAAAAAAAA" href="http://example.com">http://example.com</a>`
        const expected = "[example]: http://example.com"
        expect(cleanse(input)).to.eql(expected)
    })

    it("should render a complex example with multiple images", () => {
        const input = `<div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">You should be able to install it by clicking on the **More actions** button in the top right of this page.</div><div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);"><br></div><div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);"><img originalsrc="cid:18baea5f-c601-4657-a0b0-b53ba36c5059" size="11236937" contenttype="image/png" style="max-width: 100%; user-select: none;" crossorigin="use-credentials" src="https://attachments.office.net/owa/test%40example.com/service.svc/s/GetAttachmentThumbnail?id=AAMkADLTY2NDgtNDAzYS0" unselectable="on" tabindex="-1"></div><div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);"><br></div><div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">Then in that menu, click on **Get Add-ins**<br></div><div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);"><img originalsrc="cid:18baea5f-c601-4657-a0b0-b53ba36c5059" size="11236937" contenttype="image/png" style="max-width: 100%; user-select: none;" crossorigin="use-credentials" src="https://attachments.office.net/owa/test%40example.com/service.svc/s/GetAttachmentThumbnail?id=AAMkADLTY2NDgtNDAzYS0" unselectable="on" tabindex="-1"></div><div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);"><br></div><div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">Then go to **My add-ins**</div><div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);"><img originalsrc="cid:18baea5f-c601-4657-a0b0-b53ba36c5059" size="11236937" contenttype="image/png" style="max-width: 100%; user-select: none;" crossorigin="use-credentials" src="https://attachments.office.net/owa/test%40example.com/service.svc/s/GetAttachmentThumbnail?id=AAMkADLTY2NDgtNDAzYS0" unselectable="on" tabindex="-1"></div><div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">And choose **Add a custom add-in** &amp;rarr; **Add from URL...**<br></div><div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);"><img originalsrc="cid:18baea5f-c601-4657-a0b0-b53ba36c5059" size="11236937" contenttype="image/png" style="max-width: 100%; user-select: none;" crossorigin="use-credentials" src="https://attachments.office.net/owa/test%40example.com/service.svc/s/GetAttachmentThumbnail?id=AAMkADLTY2NDgtNDAzYS0" unselectable="on" tabindex="-1"></div><div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);"><br></div><div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">Put \`https://markout.sierrasoftworks.com/outlook/manifest.xml\` in the text box and voila, it should be installed <span id="😄">:smile:</span><br></div>`
        const expected = [
            "You should be able to install it by clicking on the **More actions** button in the top right of this page.",
            "",
            `<img originalsrc="cid:18baea5f-c601-4657-a0b0-b53ba36c5059" size="11236937" contenttype="image/png" style="max-width: 100%; user-select: none;" crossorigin="use-credentials" src="https://attachments.office.net/owa/test%40example.com/service.svc/s/GetAttachmentThumbnail?id=AAMkADLTY2NDgtNDAzYS0" unselectable="on" tabindex="-1">`,
            "",
            "Then in that menu, click on **Get Add-ins**",
            `<img originalsrc="cid:18baea5f-c601-4657-a0b0-b53ba36c5059" size="11236937" contenttype="image/png" style="max-width: 100%; user-select: none;" crossorigin="use-credentials" src="https://attachments.office.net/owa/test%40example.com/service.svc/s/GetAttachmentThumbnail?id=AAMkADLTY2NDgtNDAzYS0" unselectable="on" tabindex="-1">`,
            "",
            "Then go to **My add-ins**",
            `<img originalsrc="cid:18baea5f-c601-4657-a0b0-b53ba36c5059" size="11236937" contenttype="image/png" style="max-width: 100%; user-select: none;" crossorigin="use-credentials" src="https://attachments.office.net/owa/test%40example.com/service.svc/s/GetAttachmentThumbnail?id=AAMkADLTY2NDgtNDAzYS0" unselectable="on" tabindex="-1">`,
            "And choose **Add a custom add-in** → **Add from URL...**",
            `<img originalsrc="cid:18baea5f-c601-4657-a0b0-b53ba36c5059" size="11236937" contenttype="image/png" style="max-width: 100%; user-select: none;" crossorigin="use-credentials" src="https://attachments.office.net/owa/test%40example.com/service.svc/s/GetAttachmentThumbnail?id=AAMkADLTY2NDgtNDAzYS0" unselectable="on" tabindex="-1">`,
            "",
            "Put `https://markout.sierrasoftworks.com/outlook/manifest.xml` in the text box and voila, it should be installed :smile:",
            ""
        ]

        const output = cleanse(input)

        expect(output.split("\n")).to.eql(expected)
    })
})