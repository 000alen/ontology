import { describe, expect, it } from 'vitest'
import { cartesianProduct, take } from './iter.js'

describe('Iterator Utilities', () => {
  describe('cartesianProduct', () => {
    it('should generate cartesian product of two arrays', () => {
      const arrays = [["1", "2"], ['a', 'b']]
      const result = Array.from(cartesianProduct(arrays))
      
      expect(result).toEqual([
        ['1', 'a'],
        ['1', 'b'],
        ['2', 'a'],
        ['2', 'b']
      ])
    })

    it('should generate cartesian product of three arrays', () => {
      const arrays = [["1", "2"], ['a'], ["true", "false"]]
      const result = Array.from(cartesianProduct(arrays))
      
      expect(result).toEqual([
        ['1', 'a', 'true'],
        ['1', 'a', 'false'],
        ['2', 'a', 'true'],
        ['2', 'a', 'false']
      ])
    })

    it('should return empty generator for empty input', () => {
      const result = Array.from(cartesianProduct([]))
      expect(result).toEqual([])
    })

    it('should return empty generator if any array is empty', () => {
      const arrays = [["1", "2"], [], ['a', 'b']]
      const result = Array.from(cartesianProduct(arrays))
      expect(result).toEqual([])
    })

    it('should handle single array', () => {
      const arrays = [["1", "2", "3"]]
      const result = Array.from(cartesianProduct(arrays))
      
      expect(result).toEqual([
        ["1"],
        ["2"],
        ["3"]
      ])
    })

    it('should handle arrays with different lengths', () => {
      const arrays = [["1"], ['a', 'b', 'c'], ["true"]]
      const result = Array.from(cartesianProduct(arrays))
      
      expect(result).toEqual([
        ['1', 'a', 'true'],
        ['1', 'b', 'true'],
        ['1', 'c', 'true']
      ])
    })
  })

  describe('take', () => {
    it('should take first n elements from array', () => {
      const input = ["1", "2", "3", "4", "5"]
      const result = Array.from(take(input, 3))
      
      expect(result).toEqual(["1", "2", "3"])
    })

    it('should take all elements if n is larger than array length', () => {
      const input = ["1", "2", "3"]
      const result = Array.from(take(input, 10))
      
      expect(result).toEqual(["1", "2", "3"])
    })

    it('should return empty array when n is 0', () => {
      const input = ["1", "2", "3"]
      const result = Array.from(take(input, 0))
      
      expect(result).toEqual([])
    })

    it('should work with generators', () => {
      function* numberGenerator() {
        let i = 0
        while (true) {
          yield i++
        }
      }
      
      const result = Array.from(take(numberGenerator(), 5))
      expect(result).toEqual([0, 1, 2, 3, 4])
    })

    it('should work with empty iterable', () => {
      const input: number[] = []
      const result = Array.from(take(input, 5))
      
      expect(result).toEqual([])
    })

    it('should handle negative n gracefully', () => {
      const input = ["1", "2", "3"]
      const result = Array.from(take(input, -1))
      
      expect(result).toEqual([])
    })
  })
}) 