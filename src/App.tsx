import { useState } from 'react'
import { ArrowUpRight, ChartNoAxesCombined, RotateCcw, Sparkles } from 'lucide-react'
import { calculate, defaultInput, validateInput, type CalculatorInput, type Calculation } from './lib/calculate'
import './App.css'

const money = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 })
const compact = new Intl.NumberFormat('th-TH', { notation: 'compact', maximumFractionDigits: 1 })
type Field = keyof CalculatorInput

const fields: { key: Field; label: string; unit: string; hint: string; max: number; step: string }[] = [
  { key: 'principal', label: 'เงินต้นเริ่มต้น', unit: 'บาท', hint: 'เงินก้อนแรกที่เริ่มลงทุน', max: 1_000_000_000, step: '0.01' },
  { key: 'monthlyDeposit', label: 'ฝากเพิ่มทุกเดือน', unit: 'บาท', hint: 'ฝากเพิ่มในวันสิ้นเดือน', max: 10_000_000, step: '0.01' },
  { key: 'annualRate', label: 'ผลตอบแทนต่อปี', unit: '%', hint: 'อัตราเฉลี่ยต่อปี', max: 100, step: '0.01' },
  { key: 'years', label: 'ระยะเวลาลงทุน', unit: 'ปี', hint: 'ตั้งแต่ 1 ถึง 50 ปี', max: 50, step: '1' },
]

function GrowthChart({ result, principal }: { result: Calculation; principal: number }) {
  const left = 4
  const right = 636
  const bottom = 202
  const points = [{ year: 0, invested: principal, balance: principal }, ...result.years]
  const maximum = Math.max(result.balance, 1)
  const x = (year: number) => left + (year / result.years.length) * (right - left)
  const y = (value: number) => bottom - (value / maximum) * 186
  const line = (key: 'balance' | 'invested') => points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(point.year).toFixed(1)} ${y(point[key]).toFixed(1)}`).join(' ')
  const area = (key: 'balance' | 'invested') => `${line(key)} L ${right} ${bottom} L ${left} ${bottom} Z`

  return (
    <div className="chart-wrap">
      <svg viewBox="0 0 640 235" role="img" aria-label={`กราฟยอดเงินเติบโตจากเงินลงทุน ${money.format(result.invested)} บาท เป็น ${money.format(result.balance)} บาทใน ${result.years.length} ปี`}>
        {[0, 0.5, 1].map((level) => (
          <g key={level}>
            <line x1={left} x2={right} y1={y(maximum * level)} y2={y(maximum * level)} className="grid-line" />
            {level > 0 && <text x={right} y={y(maximum * level) - 7} textAnchor="end" className="chart-label">{compact.format(maximum * level)}</text>}
          </g>
        ))}
        <path d={area('balance')} className="area-balance" />
        <path d={area('invested')} className="area-invested" />
        <path d={line('balance')} className="line-balance" />
        <circle cx={right} cy={y(result.balance)} r="5" className="chart-dot" />
        <text x={left} y="230" className="chart-label">วันนี้</text>
        <text x={right} y="230" textAnchor="end" className="chart-label">ปีที่ {result.years.length}</text>
      </svg>
    </div>
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

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="brand-mark" aria-hidden="true"><ChartNoAxesCombined size={22} strokeWidth={2.3} /></div>
        <span className="brand-name">เติบโต<span className="brand-period">.</span></span>
        <span className="header-tag">เครื่องมือวางแผนการเงิน</span>
      </header>

      <main className="main-content">
        <div className="intro">
          <div className="eyebrow"><span className="eyebrow-line" /> PLAN YOUR GROWTH</div>
          <h1>เงินวันนี้<br /><span>เติบโตแค่ไหน</span>ในวันหน้า?</h1>
          <p>ลองปรับตัวเลข แล้วเห็นอนาคตการลงทุนของคุณทันที</p>
        </div>

        <div className="workspace">
          <section className="input-panel" aria-labelledby="input-title">
            <div className="panel-heading">
              <div><span className="section-index">01 / ตั้งเป้าหมาย</span><h2 id="input-title">ข้อมูลการลงทุน</h2></div>
              <button className="reset-button" type="button" title="คืนค่าเริ่มต้น" aria-label="คืนค่าเริ่มต้น" onClick={() => setValues({ principal: String(defaultInput.principal), monthlyDeposit: String(defaultInput.monthlyDeposit), annualRate: String(defaultInput.annualRate), years: String(defaultInput.years) })}><RotateCcw size={17} /></button>
            </div>
            <div className="fields">
              {fields.map((field) => (
                <div className="field" key={field.key}>
                  <div className="field-top"><label htmlFor={field.key}>{field.label}</label><span>{field.hint}</span></div>
                  <div className={`input-box ${errors[field.key] ? 'input-error' : ''}`}>
                    <input id={field.key} type="number" min={field.key === 'years' ? 1 : 0} max={field.max} step={field.step} inputMode={field.key === 'years' ? 'numeric' : 'decimal'} value={values[field.key]} aria-invalid={Boolean(errors[field.key])} aria-describedby={errors[field.key] ? `${field.key}-error` : undefined} onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))} />
                    <span className="field-unit">{field.unit}</span>
                  </div>
                  {errors[field.key] && <p className="field-error" id={`${field.key}-error`}>{errors[field.key]}</p>}
                </div>
              ))}
            </div>
            <div className="input-footnote"><Sparkles size={16} aria-hidden="true" /> ปรับตัวเลขด้านบน ผลลัพธ์จะอัปเดตทันที</div>
          </section>

          <section className="results" aria-labelledby="result-title">
            <div className="result-hero">
              <div className="result-kicker"><span className="live-dot" /> ผลลัพธ์ของคุณ <ArrowUpRight size={16} aria-hidden="true" /></div>
              {result ? (
                <>
                  <h2 id="result-title">เงินปลายทางของคุณ</h2>
                  <div className="total"><span className="currency">฿</span><span>{money.format(result.balance)}</span></div>
                  <p className="hero-caption">หลังลงทุนต่อเนื่อง {input.years} ปี</p>
                  <div className="hero-divider" />
                  <div className="result-breakdown">
                    <div><span className="breakdown-label"><span className="legend-swatch swatch-invested" /> เงินที่ลงทุน</span><strong>฿{money.format(result.invested)}</strong></div>
                    <div><span className="breakdown-label"><span className="legend-swatch swatch-interest" /> ดอกเบี้ยที่ได้รับ</span><strong>฿{money.format(result.interest)}</strong></div>
                  </div>
                </>
              ) : (
                <div className="empty-result" role="status"><h2 id="result-title">ยังแสดงผลไม่ได้</h2><p>{overflow ? 'ยอดเงินเกินช่วงที่คำนวณได้ ลองลดจำนวนเงิน อัตรา หรือระยะเวลาลง' : 'ตรวจสอบข้อมูลการลงทุนเพื่อดูผลลัพธ์'}</p></div>
              )}
            </div>

            {result && (
              <>
                <div className="chart-section">
                  <div className="chart-title-row"><div><span className="section-index">02 / ภาพรวม</span><h2>เงินของคุณเติบโตอย่างไร</h2></div><span className="chart-years">{input.years} ปี</span></div>
                  <div className="chart-legend"><span><i className="legend-swatch swatch-invested" /> เงินที่ลงทุน</span><span><i className="legend-swatch swatch-interest" /> ยอดรวม</span></div>
                  <GrowthChart result={result} principal={input.principal} />
                </div>
                <div className="table-section">
                  <div className="table-heading"><div><span className="section-index">03 / รายละเอียด</span><h2>สรุปรายปี</h2></div><span className="table-count">{result.years.length} ปี</span></div>
                  <div className="table-scroll"><table><thead><tr><th scope="col">ปีที่</th><th scope="col">เงินลงทุน</th><th scope="col">ดอกเบี้ย</th><th scope="col">ยอดรวม</th></tr></thead><tbody>{result.years.map((year) => <tr key={year.year}><th scope="row">{String(year.year).padStart(2, '0')}</th><td>฿{money.format(year.invested)}</td><td>฿{money.format(year.interest)}</td><td>฿{money.format(year.balance)}</td></tr>)}</tbody></table></div>
                </div>
              </>
            )}
          </section>
        </div>
        <p className="disclaimer">* ประมาณการจากดอกเบี้ยทบต้นรายเดือน โดยฝากเพิ่มปลายเดือน ไม่รวมภาษีและเงินเฟ้อ ผลตอบแทนจริงอาจแตกต่างกัน</p>
      </main>
      <footer className="site-footer"><span>เติบโต<span className="brand-period">.</span></span><span>คิดให้เห็นภาพ ก่อนเริ่มลงทุนจริง</span></footer>
    </div>
  )
}

export default App