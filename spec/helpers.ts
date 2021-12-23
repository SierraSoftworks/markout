import {readFileSync} from "fs"
import {join} from "path"

export function readFile(name: string, stripNewlines: boolean = false): string {
    let content = readFileSync(join(__dirname, name), "utf8")

    content = content.replace(/\r/g, "")
    if (stripNewlines)
        content = content.replace(/\r?\n/g, "").trim()

    return content
}