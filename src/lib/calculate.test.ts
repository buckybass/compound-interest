import { describe, expect, it } from 'vitest'
import { calculate, validateInput } from './calculate'

describe('calculate', () => {
  it('credits monthly interest before the end-of-month deposit', () => {
    const result = calculate({ principal: 100, monthlyDeposit: 10, annualRate: 12, years: 1 })
    expect(result.balance).toBe(239.5)
    expect(result.invested).toBe(220)
    expect(result.interest).toBe(19.5)
    expect(result.years).toEqual([{ year: 1, invested: 220, interest: 19.5, balance: 239.5 }])
  })

  it('keeps zero-rate contributions separate from interest', () => {
    const result = calculate({ principal: 1000, monthlyDeposit: 50, annualRate: 0, years: 2 })
    expect(result.years).toHaveLength(2)
    expect(result.balance).toBe(2200)
    expect(result.interest).toBe(0)
  })

  it('rounds each monthly accrual to the nearest satang', () => {
    const result = calculate({ principal: 1, monthlyDeposit: 0, annualRate: 6, years: 1 })
    expect(result.balance).toBe(1.12)
  })

  it('rejects invalid input and results outside safe integer cents', () => {
    expect(validateInput({ principal: 0.29, monthlyDeposit: 0.29, annualRate: 6, years: 1 })).toEqual({})
    expect(validateInput({ principal: 0.291, monthlyDeposit: 0, annualRate: 0, years: 1 }).principal).toBeTruthy()
    expect(validateInput({ principal: -1, monthlyDeposit: 0, annualRate: 0, years: 1 }).principal).toBeTruthy()
    expect(validateInput({ principal: 0, monthlyDeposit: 0, annualRate: 0, years: 1.5 }).years).toBeTruthy()
    expect(() => calculate({ principal: 1_000_000_000, monthlyDeposit: 10_000_000, annualRate: 100, years: 50 })).toThrow(RangeError)
  })
})