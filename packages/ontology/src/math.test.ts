import { describe, expect, it } from 'vitest'
import { 
  dot, 
  magnitude, 
  cosineSimilarity, 
  cosineSimilarityOneToMany, 
  cosineSimilarityMatrix, 
  findTopSimilar 
} from './math.js'
import { Vector } from './types.js'

describe('Math Functions', () => {
  describe('dot', () => {
    it('should calculate dot product of two vectors', () => {
      expect(dot([1, 2, 3], [4, 5, 6])).toBe(32) // 1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32
      expect(dot([1, 0, 0], [0, 1, 0])).toBe(0) // orthogonal vectors
      expect(dot([3, 4], [3, 4])).toBe(25) // 3*3 + 4*4 = 9 + 16 = 25
    })

    it('should handle negative values', () => {
      expect(dot([1, -2, 3], [-4, 5, 6])).toBe(4) // 1*(-4) + (-2)*5 + 3*6 = -4 - 10 + 18 = 4
      expect(dot([-1, -2], [-3, -4])).toBe(11) // (-1)*(-3) + (-2)*(-4) = 3 + 8 = 11
    })

    it('should handle zero vectors', () => {
      expect(dot([0, 0, 0], [1, 2, 3])).toBe(0)
      expect(dot([1, 2, 3], [0, 0, 0])).toBe(0)
      expect(dot([0, 0], [0, 0])).toBe(0)
    })

    it('should handle empty vectors', () => {
      expect(dot([], [])).toBe(0)
    })

    it('should handle single element vectors', () => {
      expect(dot([5], [7])).toBe(35)
      expect(dot([-3], [4])).toBe(-12)
    })

    it('should throw error for vectors of different lengths', () => {
      expect(() => dot([1, 2], [1, 2, 3])).toThrow('Vectors must have the same length')
      expect(() => dot([1, 2, 3], [1, 2])).toThrow('Vectors must have the same length')
      expect(() => dot([], [1])).toThrow('Vectors must have the same length')
    })
  })

  describe('magnitude', () => {
    it('should calculate magnitude of vectors', () => {
      expect(magnitude([3, 4])).toBe(5) // sqrt(3^2 + 4^2) = sqrt(9 + 16) = sqrt(25) = 5
      expect(magnitude([1, 1, 1])).toBe(Math.sqrt(3)) // sqrt(1 + 1 + 1) = sqrt(3)
      expect(magnitude([0, 0, 0])).toBe(0)
      expect(magnitude([5])).toBe(5)
    })

    it('should handle negative values', () => {
      expect(magnitude([-3, -4])).toBe(5) // sqrt((-3)^2 + (-4)^2) = sqrt(9 + 16) = 5
      expect(magnitude([1, -1])).toBe(Math.sqrt(2)) // sqrt(1 + 1) = sqrt(2)
    })

    it('should handle empty vectors', () => {
      expect(magnitude([])).toBe(0)
    })

    it('should be consistent with dot product', () => {
      const vector = [2, 3, 6]
      const expectedMagnitude = Math.sqrt(dot(vector, vector))
      expect(magnitude(vector)).toBe(expectedMagnitude)
    })
  })

  describe('cosineSimilarity', () => {
    it('should calculate cosine similarity between vectors', () => {
      // Identical vectors
      expect(cosineSimilarity([1, 0, 0], [1, 0, 0])).toBe(1)
      expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBe(1)
      
      // Orthogonal vectors
      expect(cosineSimilarity([1, 0], [0, 1])).toBe(0)
      expect(cosineSimilarity([1, 0, 0], [0, 1, 0])).toBe(0)
      
      // Opposite vectors
      expect(cosineSimilarity([1, 0, 0], [-1, 0, 0])).toBeCloseTo(-1, 10)
      expect(cosineSimilarity([1, 1], [-1, -1])).toBeCloseTo(-1, 10)
    })

    it('should handle vectors with different magnitudes', () => {
      // Vectors in same direction but different magnitudes should have similarity 1
      expect(cosineSimilarity([1, 1], [2, 2])).toBeCloseTo(1, 10)
      expect(cosineSimilarity([3, 4], [6, 8])).toBeCloseTo(1, 10)
    })

    it('should calculate similarity for angled vectors', () => {
      // 45 degree angle vectors
      const similarity = cosineSimilarity([1, 0], [1, 1])
      expect(similarity).toBeCloseTo(Math.cos(Math.PI / 4), 10) // cos(45°) = 1/sqrt(2)
    })

    it('should handle zero vectors', () => {
      expect(cosineSimilarity([0, 0], [1, 2])).toBe(0)
      expect(cosineSimilarity([1, 2], [0, 0])).toBe(0)
      expect(cosineSimilarity([0, 0], [0, 0])).toBe(0)
    })

    it('should handle empty vectors', () => {
      expect(cosineSimilarity([], [])).toBe(0)
    })

    it('should throw error for vectors of different lengths', () => {
      expect(() => cosineSimilarity([1, 2], [1, 2, 3])).toThrow('Vectors must have the same length')
    })

    it('should be consistent with manual calculation', () => {
      const a = [1, 2, 3]
      const b = [4, 5, 6]
      const expectedSimilarity = dot(a, b) / (magnitude(a) * magnitude(b))
      expect(cosineSimilarity(a, b)).toBeCloseTo(expectedSimilarity, 10)
    })
  })

  describe('cosineSimilarityOneToMany', () => {
    it('should calculate similarities between query and multiple targets', () => {
      const query = [1, 0, 0]
      const targets = [
        [1, 0, 0],    // identical
        [0, 1, 0],    // orthogonal
        [-1, 0, 0],   // opposite
        [2, 0, 0]     // same direction, different magnitude
      ]
      
      const results = cosineSimilarityOneToMany(query, targets)
      expect(results).toHaveLength(4)
      expect(results[0]).toBeCloseTo(1, 10)
      expect(results[1]).toBeCloseTo(0, 10)
      expect(results[2]).toBeCloseTo(-1, 10)
      expect(results[3]).toBeCloseTo(1, 10)
    })

    it('should handle empty targets array', () => {
      const query = [1, 0]
      const targets: Vector[] = []
      expect(cosineSimilarityOneToMany(query, targets)).toEqual([])
    })

    it('should handle empty query vector', () => {
      const query: Vector = []
      const targets = [[1, 2], [3, 4]]
      expect(cosineSimilarityOneToMany(query, targets)).toEqual([0, 0])
    })

    it('should handle zero query vector', () => {
      const query = [0, 0]
      const targets = [[1, 2], [3, 4]]
      expect(cosineSimilarityOneToMany(query, targets)).toEqual([0, 0])
    })

    it('should handle zero target vectors', () => {
      const query = [1, 0]
      const targets = [[0, 0], [1, 0]]
      const results = cosineSimilarityOneToMany(query, targets)
      expect(results[0]).toBe(0)
      expect(results[1]).toBe(1)
    })

    it('should throw error for mismatched vector lengths', () => {
      const query = [1, 0]
      const targets = [[1, 0], [1, 0, 0]] // second target has different length
      expect(() => cosineSimilarityOneToMany(query, targets)).toThrow('All vectors must have the same length')
    })

    it('should be consistent with cosineSimilarity', () => {
      const query = [1, 2, 3]
      const targets = [
        [4, 5, 6],
        [7, 8, 9],
        [1, 0, 0]
      ]
      
      const batchResults = cosineSimilarityOneToMany(query, targets)
      const individualResults = targets.map(target => cosineSimilarity(query, target))
      
      expect(batchResults).toHaveLength(individualResults.length)
      batchResults.forEach((result, i) => {
        expect(result).toBeCloseTo(individualResults[i]!, 10)
      })
    })
  })

  describe('cosineSimilarityMatrix', () => {
    it('should create symmetric similarity matrix', () => {
      const vectors = [
        [1, 0],
        [0, 1],
        [1, 1]
      ]
      
      const matrix = cosineSimilarityMatrix(vectors)
      expect(matrix).toHaveLength(3)
      expect(matrix[0]).toHaveLength(3)
      
      // Check diagonal elements are 1
      expect(matrix[0]![0]).toBe(1)
      expect(matrix[1]![1]).toBe(1)
      expect(matrix[2]![2]).toBe(1)
      
      // Check symmetry
      expect(matrix[0]![1]).toBeCloseTo(matrix[1]![0]!, 10)
      expect(matrix[0]![2]).toBeCloseTo(matrix[2]![0]!, 10)
      expect(matrix[1]![2]).toBeCloseTo(matrix[2]![1]!, 10)
      
      // Check specific values
      expect(matrix[0]![1]).toBeCloseTo(0, 10) // orthogonal vectors
      expect(matrix[2]![0]).toBeCloseTo(1/Math.sqrt(2), 10) // 45 degree angle
    })

    it('should handle empty vectors array', () => {
      expect(cosineSimilarityMatrix([])).toEqual([])
    })

    it('should handle single vector', () => {
      const matrix = cosineSimilarityMatrix([[1, 2, 3]])
      expect(matrix).toEqual([[1]])
    })

    it('should handle zero vectors', () => {
      const vectors = [
        [0, 0],
        [1, 0],
        [0, 1]
      ]
      
      const matrix = cosineSimilarityMatrix(vectors)
      expect(matrix[0]![0]).toBe(1) // diagonal
      expect(matrix[0]![1]).toBe(0) // zero vector vs non-zero
      expect(matrix[1]![0]).toBe(0) // symmetric
      expect(matrix[1]![2]).toBe(0) // orthogonal
    })

    it('should throw error for mismatched vector lengths', () => {
      const vectors = [
        [1, 0],
        [1, 0, 0] // different length
      ]
      expect(() => cosineSimilarityMatrix(vectors)).toThrow('All vectors must have the same length')
    })

    it('should be consistent with cosineSimilarity', () => {
      const vectors = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        [1, 0, 0]
      ]
      
      const matrix = cosineSimilarityMatrix(vectors)
      
      // Check all pairwise similarities
      for (let i = 0; i < vectors.length; i++) {
        for (let j = 0; j < vectors.length; j++) {
          const expectedSimilarity = cosineSimilarity(vectors[i]!, vectors[j]!)
          expect(matrix[i]![j]).toBeCloseTo(expectedSimilarity, 10)
        }
      }
    })
  })

  describe('findTopSimilar', () => {
    it('should find top-k most similar vectors', () => {
      const query = [1, 0, 0]
      const targets = [
        [0.9, 0.436, 0],  // high similarity
        [0, 1, 0],        // orthogonal
        [0.8, 0.6, 0],    // medium similarity
        [-1, 0, 0],       // opposite
        [0.5, 0.866, 0]   // lower similarity
      ]
      
      const top2 = findTopSimilar(query, targets, 2)
      expect(top2).toHaveLength(2)
      
      // Results should be sorted by similarity descending
      expect(top2[0]!.similarity).toBeGreaterThan(top2[1]!.similarity)
      
      // Check the actual similarities
      expect(top2[0]!.similarity).toBeCloseTo(cosineSimilarity(query, targets[top2[0]!.index]!), 10)
      expect(top2[1]!.similarity).toBeCloseTo(cosineSimilarity(query, targets[top2[1]!.index]!), 10)
    })

    it('should handle k larger than number of targets', () => {
      const query = [1, 0]
      const targets = [[1, 0], [0, 1]]
      const result = findTopSimilar(query, targets, 5)
      expect(result).toHaveLength(2) // only 2 targets available
    })

    it('should handle k = 0', () => {
      const query = [1, 0]
      const targets = [[1, 0], [0, 1]]
      const result = findTopSimilar(query, targets, 0)
      expect(result).toHaveLength(0)
    })

    it('should handle empty targets', () => {
      const query = [1, 0]
      const targets: Vector[] = []
      const result = findTopSimilar(query, targets, 2)
      expect(result).toHaveLength(0)
    })

    it('should respect similarity threshold', () => {
      const query = [1, 0, 0]
      const targets = [
        [0.9, 0.436, 0],  // similarity ~0.9
        [0.5, 0.866, 0],  // similarity ~0.5
        [0, 1, 0],        // similarity = 0
        [-1, 0, 0]        // similarity = -1
      ]
      
      const result = findTopSimilar(query, targets, 10, 0.6) // threshold = 0.6
      expect(result.length).toBeLessThan(targets.length)
      
      // All results should be above threshold
      result.forEach(({ similarity }) => {
        expect(similarity).toBeGreaterThanOrEqual(0.6)
      })
    })

    it('should be consistent with cosineSimilarityOneToMany', () => {
      const query = [1, 2, 3]
      const targets = [
        [4, 5, 6],
        [7, 8, 9],
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
      ]
      
      const topResults = findTopSimilar(query, targets, targets.length)
      const allSimilarities = cosineSimilarityOneToMany(query, targets)
      
      // Verify that the similarities in topResults match the computed similarities
      topResults.forEach(({ index, similarity }) => {
        expect(similarity).toBeCloseTo(allSimilarities[index]!, 10)
      })
      
      // Verify sorting
      for (let i = 0; i < topResults.length - 1; i++) {
        expect(topResults[i]!.similarity).toBeGreaterThanOrEqual(topResults[i + 1]!.similarity)
      }
    })
  })

  describe('Cross-validation tests', () => {
    it('should ensure magnitude is consistent with dot product', () => {
      const testVectors = [
        [1, 2, 3],
        [0, 0, 0],
        [-1, -2, -3],
        [1.5, 2.7, 3.14159],
        [100, 200, 300]
      ]
      
      testVectors.forEach(vector => {
        const mag1 = magnitude(vector)
        const mag2 = Math.sqrt(dot(vector, vector))
        expect(mag1).toBeCloseTo(mag2, 10)
      })
    })

    it('should ensure cosineSimilarity is consistent with manual calculation', () => {
      const testCases = [
        { a: [1, 2, 3], b: [4, 5, 6] },
        { a: [1, 0, 0], b: [0, 1, 0] },
        { a: [1, 1, 1], b: [1, 1, 1] },
        { a: [3, 4], b: [4, 3] },
        { a: [-1, -2], b: [1, 2] }
      ]
      
      testCases.forEach(({ a, b }) => {
        const similarity1 = cosineSimilarity(a, b)
        const similarity2 = dot(a, b) / (magnitude(a) * magnitude(b))
        expect(similarity1).toBeCloseTo(similarity2, 10)
      })
    })

    it('should ensure all similarity functions give consistent results', () => {
      const query = [1, 2, 3, 4]
      const targets = [
        [1, 2, 3, 4],
        [4, 3, 2, 1],
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
        [-1, -2, -3, -4]
      ]
      
      // Test consistency between cosineSimilarity and cosineSimilarityOneToMany
      const batchResults = cosineSimilarityOneToMany(query, targets)
      const individualResults = targets.map(target => cosineSimilarity(query, target))
      
      expect(batchResults).toHaveLength(individualResults.length)
      batchResults.forEach((result, i) => {
        expect(result).toBeCloseTo(individualResults[i]!, 10)
      })
      
      // Test consistency with cosineSimilarityMatrix
      const allVectors = [query, ...targets]
      const matrix = cosineSimilarityMatrix(allVectors)
      
      // Check first row (query similarities)
      for (let i = 1; i < allVectors.length; i++) {
        expect(matrix[0]![i]).toBeCloseTo(individualResults[i - 1]!, 10)
      }
      
      // Test consistency with findTopSimilar
      const topResults = findTopSimilar(query, targets, targets.length)
      topResults.forEach(({ index, similarity }) => {
        expect(similarity).toBeCloseTo(individualResults[index]!, 10)
      })
    })
  })

  describe('Performance and edge cases', () => {
    it('should handle large vectors efficiently', () => {
      const size = 1000
      const query = Array.from({ length: size }, (_, i) => Math.sin(i * 0.01))
      const targets = Array.from({ length: 100 }, (_, i) => 
        Array.from({ length: size }, (_, j) => Math.cos((i + j) * 0.01))
      )
      
      const start = performance.now()
      const results = cosineSimilarityOneToMany(query, targets)
      const end = performance.now()
      
      expect(results).toHaveLength(100)
      expect(end - start).toBeLessThan(1000) // Should complete in under 1 second
    })

    it('should handle numerical precision edge cases', () => {
      // Very small numbers
      const smallVector = [1e-10, 1e-10, 1e-10]
      expect(magnitude(smallVector)).toBeCloseTo(Math.sqrt(3e-20), 20)
      
      // Very large numbers
      const largeVector = [1e10, 1e10, 1e10]
      expect(magnitude(largeVector)).toBeCloseTo(Math.sqrt(3e20), 10)
      
      // Mixed scales
      const mixedVector = [1e-5, 1e5, 1]
      expect(magnitude(mixedVector)).toBeCloseTo(Math.sqrt(1e-10 + 1e10 + 1), 10)
    })

    it('should maintain symmetry properties', () => {
      const testVectors = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ]
      
      // Test symmetry of cosineSimilarity
      for (let i = 0; i < testVectors.length; i++) {
        for (let j = 0; j < testVectors.length; j++) {
          const sim1 = cosineSimilarity(testVectors[i]!, testVectors[j]!)
          const sim2 = cosineSimilarity(testVectors[j]!, testVectors[i]!)
          expect(sim1).toBeCloseTo(sim2, 10)
        }
      }
      
      // Test symmetry of cosineSimilarityMatrix
      const matrix = cosineSimilarityMatrix(testVectors)
      for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix.length; j++) {
          expect(matrix[i]![j]).toBeCloseTo(matrix[j]![i]!, 10)
        }
      }
    })
  })
}) 