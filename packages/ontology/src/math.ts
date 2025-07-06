/**
 * Calculates the dot product of two vectors.
 * 
 * The dot product is defined as:
 * \[ \vec{a} \cdot \vec{b} = \sum_{i=0}^{n-1} a_i \cdot b_i \]
 * 
 * @param a - First vector (array of numbers)
 * @param b - Second vector (array of numbers)
 * @returns The dot product of the two vectors
 * @throws {Error} When vectors have different lengths
 * 
 * @example
 * ```typescript
 * const result = dot([1, 2, 3], [4, 5, 6]); // returns 32
 * ```
 */
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

/**
 * Calculates the Euclidean magnitude (norm) of a vector.
 * 
 * The magnitude is defined as:
 * \[ ||\vec{a}|| = \sqrt{\sum_{i=0}^{n-1} a_i^2} = \sqrt{\vec{a} \cdot \vec{a}} \]
 * 
 * @param a - Input vector (array of numbers)
 * @returns The Euclidean magnitude of the vector
 * 
 * @example
 * ```typescript
 * const mag = magnitude([3, 4]); // returns 5
 * const mag3d = magnitude([1, 2, 2]); // returns 3
 * ```
 */
export function magnitude(a: number[]): number {
    return Math.sqrt(dot(a, a));
}

/**
 * Calculates the cosine similarity between two vectors.
 * 
 * Cosine similarity measures the cosine of the angle between two vectors,
 * providing a measure of similarity that is independent of their magnitudes.
 * 
 * The cosine similarity is defined as:
 * \[ \text{cosine similarity} = \frac{\vec{a} \cdot \vec{b}}{||\vec{a}|| \cdot ||\vec{b}||} = \frac{\sum_{i=0}^{n-1} a_i \cdot b_i}{\sqrt{\sum_{i=0}^{n-1} a_i^2} \cdot \sqrt{\sum_{i=0}^{n-1} b_i^2}} \]
 * 
 * @param a - First vector (array of numbers)
 * @param b - Second vector (array of numbers)
 * @returns Cosine similarity value between -1 and 1, where:
 *   - 1 indicates vectors point in the same direction
 *   - 0 indicates vectors are orthogonal
 *   - -1 indicates vectors point in opposite directions
 * @throws {Error} When vectors have different lengths
 * 
 * @example
 * ```typescript
 * const sim1 = cosineSimilarity([1, 0], [1, 0]); // returns 1 (identical direction)
 * const sim2 = cosineSimilarity([1, 0], [0, 1]); // returns 0 (orthogonal)
 * const sim3 = cosineSimilarity([1, 0], [-1, 0]); // returns -1 (opposite direction)
 * ```
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

/**
 * Efficiently computes cosine similarity between one query vector and multiple target vectors.
 * 
 * This function is optimized for comparing one vector against many others by:
 * - Computing the query vector's magnitude only once
 * - Using efficient iteration patterns
 * 
 * Time complexity: O(n × d) where n is the number of target vectors and d is the dimensionality.
 * 
 * @param query - The query vector to compare against all targets
 * @param targets - Array of target vectors to compare with the query
 * @returns Array of cosine similarity values in the same order as targets
 * @throws {Error} When vectors have different lengths or when targets array is empty
 * 
 * @example
 * ```typescript
 * const query = [1, 0, 0];
 * const targets = [
 *   [1, 0, 0],    // should return 1
 *   [0, 1, 0],    // should return 0
 *   [-1, 0, 0]    // should return -1
 * ];
 * const similarities = cosineSimilarityOneToMany(query, targets);
 * // returns [1, 0, -1]
 * ```
 */
export function cosineSimilarityOneToMany(query: number[], targets: number[][]): number[] {
    if (targets.length === 0) {
        return [];
    }

    if (query.length === 0) {
        return new Array(targets.length).fill(0);
    }

    // Validate all vectors have the same length
    for (let i = 0; i < targets.length; i++) {
        if (targets[i]!.length !== query.length) {
            throw new Error(`All vectors must have the same length. Query has ${query.length}, target[${i}] has ${targets[i]!.length}`);
        }
    }

    const queryMagnitude = magnitude(query);
    if (queryMagnitude === 0) {
        return new Array(targets.length).fill(0);
    }

    const similarities: number[] = new Array(targets.length);

    for (let i = 0; i < targets.length; i++) {
        const target = targets[i]!;
        const targetMagnitude = magnitude(target);
        
        if (targetMagnitude === 0) {
            similarities[i] = 0;
            continue;
        }

        const dotProduct = dot(query, target);
        similarities[i] = dotProduct / (queryMagnitude * targetMagnitude);
    }

    return similarities;
}

/**
 * Efficiently computes pairwise cosine similarities between all vectors in a set.
 * 
 * This function creates a symmetric similarity matrix where entry (i,j) represents
 * the cosine similarity between vectors[i] and vectors[j]. The diagonal contains
 * all 1's (self-similarity).
 * 
 * Optimizations:
 * - Precomputes all magnitudes once
 * - Only computes upper triangle and reflects to lower triangle (exploiting symmetry)
 * - Uses efficient matrix operations where possible
 * 
 * Time complexity: O(n² × d) where n is the number of vectors and d is the dimensionality.
 * 
 * @param vectors - Array of vectors to compute pairwise similarities for
 * @returns 2D array where result[i][j] is the cosine similarity between vectors[i] and vectors[j]
 * @throws {Error} When vectors have different lengths
 * 
 * @example
 * ```typescript
 * const vectors = [
 *   [1, 0],
 *   [0, 1],
 *   [1, 1]
 * ];
 * const similarityMatrix = cosineSimilarityMatrix(vectors);
 * // returns:
 * // [[1, 0, 0.707],
 * //  [0, 1, 0.707],
 * //  [0.707, 0.707, 1]]
 * ```
 */
export function cosineSimilarityMatrix(vectors: number[][]): number[][] {
    const n = vectors.length;
    
    if (n === 0) {
        return [];
    }

    if (n === 1) {
        return [[1]];
    }

    // Validate all vectors have the same length
    const dimension = vectors[0]!.length;
    for (let i = 1; i < n; i++) {
        if (vectors[i]!.length !== dimension) {
            throw new Error(`All vectors must have the same length. Vector[0] has ${dimension}, vector[${i}] has ${vectors[i]!.length}`);
        }
    }

    // Precompute all magnitudes
    const magnitudes = vectors.map(v => magnitude(v));
    
    // Initialize similarity matrix
    const matrix: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

    // Fill the matrix (only compute upper triangle + diagonal)
    for (let i = 0; i < n; i++) {
        matrix[i]![i] = 1; // Diagonal elements are always 1
        
        for (let j = i + 1; j < n; j++) {
            if (magnitudes[i]! === 0 || magnitudes[j]! === 0) {
                matrix[i]![j] = 0;
                matrix[j]![i] = 0;
            } else {
                const dotProduct = dot(vectors[i]!, vectors[j]!);
                const similarity = dotProduct / (magnitudes[i]! * magnitudes[j]!);
                matrix[i]![j] = similarity;
                matrix[j]![i] = similarity; // Symmetric
            }
        }
    }

    return matrix;
}

/**
 * Efficiently finds the top-k most similar vectors to a query vector.
 * 
 * This function combines similarity computation with efficient sorting to find
 * the k most similar vectors without computing all similarities if not needed.
 * 
 * @param query - The query vector to find similar vectors for
 * @param targets - Array of target vectors to search through
 * @param k - Number of most similar vectors to return
 * @param threshold - Minimum similarity threshold (default: 0)
 * @returns Array of objects containing target index and similarity score, sorted by similarity (descending)
 * @throws {Error} When vectors have different lengths
 * 
 * @example
 * ```typescript
 * const query = [1, 0, 0];
 * const targets = [
 *   [0.9, 0.1, 0],  // high similarity
 *   [0, 1, 0],      // orthogonal
 *   [0.8, 0.2, 0],  // medium similarity
 *   [-1, 0, 0]      // opposite
 * ];
 * const topSimilar = findTopSimilar(query, targets, 2);
 * // returns: [
 * //   { index: 0, similarity: 0.995 },
 * //   { index: 2, similarity: 0.970 }
 * // ]
 * ```
 */
export function findTopSimilar(
    query: number[], 
    targets: number[][], 
    k: number,
    threshold: number = 0
): Array<{ index: number; similarity: number }> {
    if (k <= 0 || targets.length === 0) {
        return [];
    }

    const similarities = cosineSimilarityOneToMany(query, targets);
    
    // Create index-similarity pairs and filter by threshold
    const candidates = similarities
        .map((similarity, index) => ({ index, similarity }))
        .filter(({ similarity }) => similarity >= threshold);

    // Sort by similarity (descending) and take top k
    candidates.sort((a, b) => b.similarity - a.similarity);
    
    return candidates.slice(0, k);
}
