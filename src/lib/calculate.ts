export type CalculatorInput = {
  principal: number
  monthlyDeposit: number
  annualRate: number
  years: number
}

export type YearResult = {
  year: number
  invested: number
  annualInterest: number
  interest: number
  balance: number
}

export type Calculation = {
  invested: number
  interest: number
  balance: number
  years: YearResult[]
}

export const defaultInput: CalculatorInput = {
  principal: 100000,
  monthlyDeposit: 5000,
  annualRate: 6,
  years: 20,
}

export function validateInput(input: CalculatorInput): Partial<Record<keyof CalculatorInput, string>> {
  const errors: Partial<Record<keyof CalculatorInput, string>> = {}
  if (!Number.isFinite(input.principal) || input.principal < 0 || input.principal > 1_000_000_000 || Number(input.principal.toFixed(2)) !== input.principal) {
    errors.principal = 'กรอกจำนวนเงิน 0–1,000,000,000 บาท ไม่เกิน 2 ตำแหน่ง'
  }
  if (!Number.isFinite(input.monthlyDeposit) || input.monthlyDeposit < 0 || input.monthlyDeposit > 10_000_000 || Number(input.monthlyDeposit.toFixed(2)) !== input.monthlyDeposit) {
    errors.monthlyDeposit = 'กรอกจำนวนเงิน 0–10,000,000 บาท ไม่เกิน 2 ตำแหน่ง'
  }
  if (!Number.isFinite(input.annualRate) || input.annualRate < 0 || input.annualRate > 100) {
    errors.annualRate = 'กรอกอัตราดอกเบี้ยระหว่าง 0–100%'
  }
  if (!Number.isInteger(input.years) || input.years < 1 || input.years > 50) {
    errors.years = 'กรอกจำนวนปีเต็มระหว่าง 1–50 ปี'
  }
  return errors
}

export function calculate(input: CalculatorInput): Calculation {
  if (Object.keys(validateInput(input)).length) {
    throw new RangeError('Invalid calculator input')
  }

  let balanceCents = Math.round(input.principal * 100)
  let investedCents = balanceCents
  let annualInterestCents = 0
  const depositCents = Math.round(input.monthlyDeposit * 100)
  const years: YearResult[] = []

  for (let month = 1; month <= input.years * 12; month++) {
    const monthlyInterestCents = Math.round(balanceCents * input.annualRate / 1200)
    balanceCents += monthlyInterestCents
    annualInterestCents += monthlyInterestCents
    balanceCents += depositCents
    investedCents += depositCents
    if (!Number.isSafeInteger(balanceCents)) {
      throw new RangeError('Result exceeds supported precision')
    }
    if (month % 12 === 0) {
      years.push({
        year: month / 12,
        invested: investedCents / 100,
        annualInterest: annualInterestCents / 100,
        interest: (balanceCents - investedCents) / 100,
        balance: balanceCents / 100,
      })
      annualInterestCents = 0
    }
  }

  return {
    invested: investedCents / 100,
    interest: (balanceCents - investedCents) / 100,
    balance: balanceCents / 100,
    years,
  }
}