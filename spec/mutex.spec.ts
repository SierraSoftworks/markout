import {PromiseSequencer} from "../src/lib/mutex";
import { expect } from "chai";

describe("mutex", () => {
    it("should run promises in sequence", () => {
        const seq = new PromiseSequencer();

        const expected = [1, 2, 3, 4, 5];
        const run = [];
        const completed = [];
        const tasks = [];

        expected.forEach(x => {
            const xx = x;
            tasks.push(seq.do(() => {
                run.push(xx);

                return new Promise((resolve) => {
                    setTimeout(() => resolve(xx), Math.random() * 10);
                })
            }).then(y => completed.push(y)));
        })

        return Promise.all(tasks).then(() => {
            expect(run).eql(expected)
            expect(completed).eql(expected)
        })
    })
})