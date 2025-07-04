/**
 * Calculates the cosine similarity between two vectors.
 * 
 * @param a - First vector (array of numbers)
 * @param b - Second vector (array of numbers)
 * @returns Cosine similarity value between -1 and 1
 */
export function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
        throw new Error("Vectors must have the same length");
    }
    
    if (a.length === 0) {
        return 0;
    }
    
    // Calculate dot product
    let dotProduct = 0;
    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i]! * b[i]!;
    }
    
    // Calculate magnitudes
    let magnitudeA = 0;
    let magnitudeB = 0;
    for (let i = 0; i < a.length; i++) {
        magnitudeA += a[i]! * a[i]!;
        magnitudeB += b[i]! * b[i]!;
    }
    
    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);
    
    // Handle zero vectors
    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }
    
    return dotProduct / (magnitudeA * magnitudeB);
}
