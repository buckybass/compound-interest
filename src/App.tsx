import { useState } from 'react'
import { CalendarDays, ChartNoAxesCombined, Coins, Percent, RotateCcw, Wallet } from 'lucide-react'
import { calculate, defaultInput, validateInput, type CalculatorInput, type Calculation } from './lib/calculate'

const money = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 })
const compact = new Intl.NumberFormat('th-TH', { notation: 'compact', maximumFractionDigits: 1 })
type Field = keyof CalculatorInput

const fields = [
  { key: 'principal', label: 'เงินต้น', hint: 'จำนวนเงินเริ่มต้น', unit: 'บาท', icon: Wallet, tint: 'bg-[#e4f0ec] text-[#21745b]', max: 1_000_000_000, step: '0.01' },
  { key: 'monthlyDeposit', label: 'ฝากต่อเดือน', hint: 'ฝากเพิ่มสิ้นเดือน', unit: 'บาท', icon: Coins, tint: 'bg-[#fff0e6] text-[#b2693e]', max: 10_000_000, step: '0.01' },
  { key: 'annualRate', label: 'ดอกเบี้ยต่อปี', hint: 'อัตราผลตอบแทนเฉลี่ย', unit: '%', icon: Percent, tint: 'bg-[#e8edf9] text-[#5272b1]', max: 100, step: '0.01' },
  { key: 'years', label: 'ระยะเวลา', hint: 'ลงทุนต่อเนื่อง', unit: 'ปี', icon: CalendarDays, tint: 'bg-[#f2eaf2] text-[#8b678e]', max: 50, step: '1' },
] as const

function GrowthChart({ result, principal }: { result: Calculation; principal: number }) {
  const points = [{ year: 0, invested: principal, balance: principal }, ...result.years]
  const maximum = Math.max(result.balance, 1)
  const x = (year: number) => 10 + year / result.years.length * 620
  const y = (amount: number) => 205 - amount / maximum * 180
  const line = (key: 'balance' | 'invested') => points.map((point, index) => `${index ? 'L' : 'M'} ${x(point.year).toFixed(1)} ${y(point[key]).toFixed(1)}`).join(' ')
  const area = (key: 'balance' | 'invested') => `${line(key)} L 630 205 L 10 205 Z`

  return (
    <svg viewBox="0 0 640 240" className="block h-auto w-full" role="img" aria-label={`กราฟยอดเงินจาก ${money.format(principal)} บาท เป็น ${money.format(result.balance)} บาทใน ${result.years.length} ปี`}>
      {[0, 0.5, 1].map((level) => (
        <g key={level}>
          <line x1="10" x2="630" y1={y(maximum * level)} y2={y(maximum * level)} className="chart-grid" />
          {level > 0 && <text x="626" y={y(maximum * level) - 8} textAnchor="end" className="chart-caption">{compact.format(maximum * level)}</text>}
        </g>
      ))}
      <path d={area('balance')} className="chart-area-total" />
      <path d={area('invested')} className="chart-area-invested" />
      <path d={line('balance')} className="chart-line" />
      <circle cx="630" cy={y(result.balance)} r="5" className="chart-end" />
      <text x="10" y="233" className="chart-caption">วันนี้</text>
      <text x="630" y="233" textAnchor="end" className="chart-caption">ปีที่ {result.years.length}</text>
    </svg>
  )
}

function App() {
  const [values, setValues] = useState<Record<Field, string>>({
    principal: String(defaultInput.principal),
    monthlyDeposit: String(defaultInput.monthlyDeposit),
    annualRate: String(defaultInput.annualRate),
    years: String(defaultInput.years),
  })

  const input: CalculatorInput = {
    principal: values.principal.trim() === '' ? NaN : Number(values.principal),
    monthlyDeposit: values.monthlyDeposit.trim() === '' ? NaN : Number(values.monthlyDeposit),
    annualRate: values.annualRate.trim() === '' ? NaN : Number(values.annualRate),
    years: values.years.trim() === '' ? NaN : Number(values.years),
  }
  const errors = validateInput(input)
  let result: Calculation | null = null
  let overflow = false
  if (Object.keys(errors).length === 0) {
    try {
      result = calculate(input)
    } catch {
      overflow = true
    }
  }

  const reset = () => setValues({
    principal: String(defaultInput.principal),
    monthlyDeposit: String(defaultInput.monthlyDeposit),
    annualRate: String(defaultInput.annualRate),
    years: String(defaultInput.years),
  })

  return (
    <div className="min-h-svh overflow-x-clip bg-[#f4f6f5] text-[#182526]">
      <div className="app-backdrop" aria-hidden="true" />
      <header className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8 lg:h-20 lg:px-12">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-[11px] bg-[#192d2d] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,.32),0_3px_9px_rgba(20,45,45,.15)]" aria-hidden="true"><ChartNoAxesCombined size={19} strokeWidth={2} /></span>
          <span className="text-[17px] font-semibold tracking-tight">เติบโต<span className="text-[#d18556]">.</span></span>
        </div>
        <span className="text-[12px] font-medium text-[#647674]">เครื่องมือวางแผนการเงิน</span>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 pb-12 pt-5 sm:px-8 lg:px-12 lg:pt-9">
        <div className="mb-6 px-1 sm:mb-8">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#55746d]">วางแผนอย่างมั่นใจ</p>
          <h1 className="text-[36px] leading-[1.24] font-bold tracking-tight text-[#172c2d] sm:text-[44px] lg:text-[50px]">เงินเติบโต<br className="sm:hidden" />ไปได้ไกลแค่ไหน</h1>
          <p className="mt-2 text-[14px] text-[#667875] sm:text-[15px]">คำนวณดอกเบี้ยทบต้นของคุณ</p>
        </div>

        <div className="calculator-layout grid gap-8 lg:grid-cols-[minmax(310px,0.86fr)_minmax(0,1.14fr)] lg:gap-x-10 lg:gap-y-0">
          <section className="layout-result min-w-0" aria-labelledby="result-title">
            <div className="glass-result relative isolate overflow-hidden rounded-[28px] p-6 text-[#172b2e] sm:p-8">
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#43645e]"><span className="size-2 rounded-full bg-[#429877] shadow-[0_0_0_4px_rgba(66,152,119,.12)]" /> ผลลัพธ์โดยประมาณ</span>
                  <span className="rounded-full border border-white/75 bg-white/45 px-3 py-1 text-[11px] font-semibold text-[#45635e] shadow-[inset_0_1px_1px_rgba(255,255,255,.8)]">{Number.isInteger(input.years) && input.years > 0 ? input.years : '–'} ปี</span>
                </div>
                {result ? (
                  <>
                    <h2 id="result-title" className="mt-7 text-[13px] font-medium text-[#526d68]">เงินปลายทางของคุณ</h2>
                    <p className="mt-1 flex items-baseline gap-1.5 font-numeric text-[30px] leading-tight font-semibold tracking-tight wrap-anywhere sm:text-[40px] lg:text-[38px] xl:text-[46px]"><span className="text-[23px] font-medium text-[#327b68]">฿</span>{money.format(result.balance)}</p>
                    <p className="mt-2 text-[12px] text-[#637c75]">จากการลงทุนต่อเนื่อง {input.years} ปี</p>
                    <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/80 pt-5 sm:gap-6">
                      <div className="min-w-0"><span className="flex items-center gap-2 text-[11px] text-[#537068]"><span className="size-2 shrink-0 rounded-full bg-[#73baa0]" />เงินที่ลงทุน</span><strong className="mt-1 block font-numeric text-[14px] font-semibold wrap-anywhere sm:text-[17px]">฿{money.format(result.invested)}</strong></div>
                      <div className="min-w-0 border-l border-white/75 pl-3 sm:pl-6"><span className="flex items-center gap-2 text-[11px] text-[#537068]"><span className="size-2 shrink-0 rounded-full bg-[#df9a6c]" />ดอกเบี้ยที่ได้รับ</span><strong className="mt-1 block font-numeric text-[14px] font-semibold wrap-anywhere sm:text-[17px]">฿{money.format(result.interest)}</strong></div>
                    </div>
                  </>
                ) : (
                  <div className="py-10" role="status"><h2 id="result-title" className="text-xl font-semibold">ยังแสดงผลไม่ได้</h2><p className="mt-2 text-[13px] text-[#526d68]">{overflow ? 'ยอดเงินเกินช่วงที่คำนวณได้ ลองลดจำนวนเงิน อัตรา หรือระยะเวลาลง' : 'ตรวจสอบข้อมูลการลงทุนเพื่อดูผลลัพธ์'}</p></div>
                )}
              </div>
            </div>
          </section>

          <section className="layout-form min-w-0" aria-labelledby="input-title">
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 id="input-title" className="text-[19px] font-semibold tracking-tight">ข้อมูลการลงทุน</h2>
              <button type="button" onClick={reset} aria-label="คืนค่าเริ่มต้น" title="คืนค่าเริ่มต้น" className="flex size-11 items-center justify-center rounded-full text-[#367968] transition-colors hover:bg-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#287b65]"><RotateCcw size={19} aria-hidden="true" /></button>
            </div>
            <div className="overflow-hidden rounded-[26px] border border-white/80 bg-white/75 shadow-[0_8px_30px_rgba(25,54,52,.05),0_1px_2px_rgba(25,54,52,.04)] backdrop-blur-xl backdrop-saturate-180">
              {fields.map((field, index) => {
                const Icon = field.icon
                return (
                  <div key={field.key}>
                    <div className="flex min-h-[76px] items-center gap-3 px-4 py-3 sm:px-5">
                      <span className={`flex size-9 shrink-0 items-center justify-center rounded-[11px] ${field.tint}`} aria-hidden="true"><Icon size={19} strokeWidth={1.8} /></span>
                      <div className="min-w-0 flex-1"><label htmlFor={field.key} className="block text-[13px] font-semibold text-[#263739] sm:text-[14px]">{field.label}</label><span className="block text-[11px] text-[#81908c]">{field.hint}</span></div>
                      <div className="flex min-w-0 shrink-0 items-baseline gap-1.5">
                        <input id={field.key} type="number" min={field.key === 'years' ? 1 : 0} max={field.max} step={field.step} inputMode={field.key === 'years' ? 'numeric' : 'decimal'} value={values[field.key]} aria-invalid={Boolean(errors[field.key])} aria-describedby={errors[field.key] ? `${field.key}-error` : undefined} onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))} className={`font-numeric w-[88px] rounded-lg bg-transparent px-1 py-2 text-right text-[17px] font-semibold text-[#172b2e] outline-none placeholder:text-[#899994] focus-visible:bg-[#e9f4ef] focus-visible:outline-2 focus-visible:outline-[#398b74] sm:w-[120px] sm:text-[19px] ${errors[field.key] ? 'text-[#b44c40] outline-2 outline-[#b44c40]' : ''}`} />
                        <span className="w-6 text-right text-[11px] font-medium text-[#71837c]">{field.unit}</span>
                      </div>
                    </div>
                    {errors[field.key] && <p id={`${field.key}-error`} className="mx-4 mb-3 pl-12 text-[11px] text-[#ad473a] sm:mx-5">{errors[field.key]}</p>}
                    {index < fields.length - 1 && <div className="ml-[64px] border-b border-[#e6ece9] sm:ml-[72px]" />}
                  </div>
                )
              })}
            </div>
            <p className="mt-3 px-2 text-[12px] leading-relaxed text-[#748580]">ดอกเบี้ยคิดรายเดือน และฝากเพิ่มในวันสิ้นเดือน</p>
          </section>

          {result && (
            <>
              <section className="layout-chart min-w-0" aria-labelledby="chart-title">
                <div className="mb-3 flex items-end justify-between px-1"><div><p className="text-[11px] font-semibold uppercase tracking-wider text-[#718881]">ภาพรวม</p><h2 id="chart-title" className="mt-1 text-[19px] font-semibold tracking-tight">เส้นทางการเติบโต</h2></div><span className="text-[12px] text-[#718881]">{input.years} ปี</span></div>
                <div className="glass-panel rounded-[26px] p-4 sm:p-6">
                  <div className="flex gap-5 px-1 text-[11px] text-[#536e67]"><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-[#76bea2]" />เงินลงทุน</span><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-[#277f67]" />ยอดรวม</span></div>
                  <div className="mt-4"><GrowthChart result={result} principal={input.principal} /></div>
                </div>
              </section>

              <section className="layout-years min-w-0" aria-labelledby="years-title">
                <div className="mb-3 flex items-end justify-between px-1"><div><p className="text-[11px] font-semibold uppercase tracking-wider text-[#718881]">รายละเอียด</p><h2 id="years-title" className="mt-1 text-[19px] font-semibold tracking-tight">สรุปรายปี</h2></div><span className="text-[12px] text-[#718881]">{result.years.length} ปี</span></div>
                <div className="glass-panel max-h-[440px] overflow-y-auto rounded-[26px] scrollbar-thin">
                  <div className="sm:hidden">
                    {result.years.map((year, index) => <div key={year.year} className="pl-5"><div className={`flex min-h-[86px] items-center justify-between gap-3 py-3 pr-5 ${index ? 'border-t border-[#e6ece9]' : ''}`}><div className="min-w-0"><span className="text-[12px] font-semibold text-[#4c7d6f]">ปีที่ {year.year}</span><p className="mt-1 font-numeric text-[11px] text-[#758681]">ลงทุน ฿{money.format(year.invested)}</p><p className="font-numeric text-[10px] text-[#8b9993]">ดอกเบี้ยสะสม ฿{money.format(year.interest)}</p></div><div className="min-w-0 text-right"><strong className="block font-numeric text-[15px] font-semibold text-[#1c3d39] wrap-anywhere">฿{money.format(year.balance)}</strong><span className="font-numeric text-[11px] text-[#b76e48]">+฿{money.format(year.annualInterest)} ปีนี้</span></div></div></div>)}
                  </div>
                  <table className="hidden w-full border-collapse text-right font-numeric text-[12px] sm:table">
                    <thead className="sticky top-0 bg-[#f7faf9] text-[#70837c]"><tr><th scope="col" className="px-5 py-4 text-left font-medium">ปีที่</th><th scope="col" className="px-3 py-4 font-medium">เงินลงทุน</th><th scope="col" className="px-3 py-4 font-medium">ดอกเบี้ยปีนี้</th><th scope="col" className="px-3 py-4 font-medium">ดอกเบี้ยสะสม</th><th scope="col" className="px-5 py-4 font-medium">ยอดรวม</th></tr></thead>
                    <tbody>{result.years.map((year) => <tr key={year.year} className="border-t border-[#e6ece9]"><th scope="row" className="px-5 py-3 text-left font-semibold text-[#4c7d6f]">{String(year.year).padStart(2, '0')}</th><td className="px-3 py-3">฿{money.format(year.invested)}</td><td className="px-3 py-3 text-[#b76e48]">฿{money.format(year.annualInterest)}</td><td className="px-3 py-3">฿{money.format(year.interest)}</td><td className="px-5 py-3 font-semibold text-[#1c3d39]">฿{money.format(year.balance)}</td></tr>)}</tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </div>
        <p className="mt-9 px-1 text-[11px] leading-5 text-[#798882]">* ผลลัพธ์เป็นเพียงการประมาณ ไม่รวมภาษี ค่าธรรมเนียม และเงินเฟ้อ ผลตอบแทนจริงอาจแตกต่างกัน</p>
      </main>
      <footer className="relative mx-auto flex max-w-6xl items-center justify-between border-t border-[#dae4df]/70 px-5 py-6 text-[11px] text-[#81908b] sm:px-8 lg:px-12"><span className="text-[14px] font-semibold text-[#253e39]">เติบโต<span className="text-[#cb855c]">.</span></span><span>วางแผนวันนี้ เพื่อวันข้างหน้า</span></footer>
    </div>
  )
}

export default App