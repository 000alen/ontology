export function* cartesianProduct<T>(arrays: T[][]): Generator<T[]> {
    if (arrays.length === 0) {
        return;
    }

    if (arrays.some(array => array.length === 0)) {
        return;
    }

    const indices = new Array(arrays.length).fill(0);

    while (true) {
        // Yield current combination
        yield indices.map((index, arrayIndex) => arrays[arrayIndex]![index]!);

        // Increment indices (like counting in mixed radix)
        let carry = 1;
        for (let i = arrays.length - 1; i >= 0 && carry; i--) {
            indices[i]! += carry;
            if (indices[i]! >= arrays[i]!.length) {
                indices[i] = 0;
                carry = 1;
            } else {
                carry = 0;
            }
        }

        // If we have a carry after processing all indices, we're done
        if (carry) {
            break;
        }
    }
}

export function* take<T>(iterable: Iterable<T>, n: number): Generator<T> {
    let i = 0;
    for (const item of iterable) {
        if (i >= n) {
            break;
        }

        yield item;
        i++;
    }
}
