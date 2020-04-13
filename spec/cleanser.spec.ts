import { readFile } from "./helpers";
import { cleanse } from "../src/lib/cleanser";
import { expect } from "chai";
import { JSDOM } from "jsdom"

const dom = new JSDOM()

global["window"] = dom.window
global["document"] = dom.window.document

function p(input: string): string {
    return `<div style="font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">${input}</div>`
}

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
    ]

describe("cleanser", function () {
    tests.forEach(test => {
        it(test.name, () => {
            let input = readFile(test.inputFile, test.stripNewlines)
            let expected = readFile(test.outputFile).split("\n")

            expect(cleanse(input).split("\n")).to.eql(expected)
        })
    })
})