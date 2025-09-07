import { describe, it, expect } from 'vitest'

describe('Basic Test Infrastructure', () => {
  it('should run basic tests', () => {
    expect(1 + 1).toBe(2)
  })

  it('should have DOM environment', () => {
    expect(typeof document).toBe('object')
    expect(typeof window).toBe('object')
  })

  it('should be able to create elements', () => {
    const div = document.createElement('div')
    div.textContent = 'Hello World'
    expect(div.textContent).toBe('Hello World')
  })
})
