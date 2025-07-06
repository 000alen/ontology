export function dot(a: number[], b: number[]): number {
    if (a.length !== b.length) {
        throw new Error("Vectors must have the same length");
    }

    if (a.length === 0) {
        return 0;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result += a[i]! * b[i]!;
    }

    return result;
}

export function magnitude(a: number[]): number {
    return Math.sqrt(dot(a, a));
}

/**
 * Calculates the cosine similarity between two vectors.
 * 
 * @param a - First vector (array of numbers)
 * @param b - Second vector (array of numbers)
 * @returns Cosine similarity value between 0 and 1
 */
export function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
        throw new Error("Vectors must have the same length");
    }

    if (a.length === 0) {
        return 0;
    }

    const dotProduct = dot(a, b);
    const magnitudeA = magnitude(a);
    const magnitudeB = magnitude(b);

    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
}
