import { readFile } from "./helpers";
import { cleanse } from "../src/lib/cleanser";
import { expect } from "chai";
import { JSDOM } from "jsdom"

const jsdom = new JSDOM()
global["DOMParser"] = jsdom.window.DOMParser;

const tests: {
    name: string,
    inputFile: string,
    outputFile: string,
    stripNewlines?: boolean
}[] = [
        {
            name: "should handle a simple line correctly",
            inputFile: "cleanser/test1.input.html",
            outputFile: "cleanser/test1.output.md",
            stripNewlines: true
        }, {
            name: "should handle line breaks correctly",
            inputFile: "cleanser/test2.input.html",
            outputFile: "cleanser/test2.output.md",
            stripNewlines: true
        }, {
            name: "should handle HTML escaped characters correctly",
            inputFile: "cleanser/test3.input.html",
            outputFile: "cleanser/test3.output.md",
            stripNewlines: true
        }, {
            name: "should handle a more complex example correctly",
            inputFile: "cleanser/test4.input.html",
            outputFile: "cleanser/test4.output.md",
            stripNewlines: true
        }, {
            name: "should handle image tags correctly",
            inputFile: "cleanser/test5.input.html",
            outputFile: "cleanser/test5.output.md",
            stripNewlines: true
        }, {
            name: "should not modify containers with IDs",
            inputFile: "cleanser/test6.input.html",
            outputFile: "cleanser/test6.output.md",
            stripNewlines: true
        }, {
            name: "should handle a weirdly formatted complex input file",
            inputFile: "cleanser/test7.input.html",
            outputFile: "cleanser/test7.output.md"
        }, {
            name: "should extract auto-linked text correctly",
            inputFile: "cleanser/test8.input.html",
            outputFile: "cleanser/test8.output.md",
            stripNewlines: true
        }, {
            name: "should correctly handle a complex example with multiple images",
            inputFile: "cleanser/test9.input.html",
            outputFile: "cleanser/test9.output.md",
            stripNewlines: true
        }, {
            name: "should correctly handle complex code blocks with indentation",
            inputFile: "cleanser/test10.input.html",
            outputFile: "cleanser/test10.output.md",
            stripNewlines: true
        },
        {
            name: "should correctly handle text from Outlook for MacOS",
            inputFile: "cleanser/test11.input.html",
            outputFile: "cleanser/test11.output.md",
            stripNewlines: false
        },
        {
            name: "should correctly handle a complex example from Outlook for MacOS including tables",
            inputFile: "cleanser/test12.input.html",
            outputFile: "cleanser/test12.output.md",
            stripNewlines: false
        }
    ]

describe("cleanser", function () {
    tests.forEach(test => {
        it(test.name, () => {
            let input = readFile(test.inputFile, test.stripNewlines)
            let expected = readFile(test.outputFile).split("\n")

            expect(cleanse(input).split("\n")).to.eql(expected)
        })
    })

    describe("when cleansing a text node", () => {
        it("should return the inner text", () => {
            expect(cleanse("this is a test")).to.be.eql("this is a test")
        })

        it("should replace inline newlines with spaces", () => {
            expect(cleanse("this is a test\nwith inline spaces")).to.be.eql("this is a test with inline spaces")
        })
    })

    describe("when cleansing a comment node", () => {
        it("should return nothing", () => {
            expect(cleanse("<!-- this is a comment -->")).to.be.eql("")
        })
    })

    describe("when cleansing a script node", () => {
        it("should return nothing", () => {
            expect(cleanse("<script>this is a script</script>")).to.be.eql("")
        })
    })

    describe("when cleansing a style node", () => {
        it("should return nothing", () => {
            expect(cleanse("<style>this is a style</style>")).to.be.eql("")
        })
    })

    describe("when cleansing an element node", () => {
        describe("for a simple element node", () => {
            it("should return the inner text", () => {
                expect(cleanse("<div>this is a div</div>")).to.be.eql("this is a div")
                expect(cleanse("<p>this is a paragraph</p>")).to.be.eql("this is a paragraph")
            })
        })

        describe("for an image node", () => {
            it("should return the node unchanged", () => {
                expect(cleanse(`<img src="https://google.com/favicon.ico" id="test">`)).to.be.eql(`<img src="https://google.com/favicon.ico" id="test">`)
            })

            it("should handle escaped properties in attributes", () => {
                expect(cleanse(`<img src="https://google.com/favicon.ico" alt="Test&#10;Newline">`)).to.be.eql(`<img src="https://google.com/favicon.ico" alt="Test\nNewline">`)
            })
        })

        describe("for a sequence of nodes", () => {
            it("should separate divs with newlines", () => {
                expect(cleanse(`<div>this is a div</div><div>this is another div</div>`)).to.be.eql("this is a div\nthis is another div")
            })

            it("should treat divs that contain only a <br> as a single newline", () => {
                expect(cleanse(`<div>this is a div<br></div><div><br></div><div>this is another div</div>`)).to.be.eql("this is a div\n\nthis is another div")   
            })
        })

        describe("for a tree of nodes", () => {
            it("should merge child trees with newlines", () => {
                expect(cleanse(`<div><div>a</div><div>b</div></div>`)).to.be.eql("a\nb")
                expect(cleanse(`<div><div>a</div><div><br></div><div>b</div></div>`)).to.be.eql("a\n\nb")
            })
        })
    })
})