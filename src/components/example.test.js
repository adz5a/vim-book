import { foo } from "./example";

test("ts only example", () => {
    expect(foo()).toBe("bar");
});
