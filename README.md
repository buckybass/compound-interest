# เติบโต. — เครื่องคำนวณดอกเบี้ยทบต้น

เว็บหน้าเดียวสำหรับลองคำนวณเงินต้น เงินฝากรายเดือน อัตราผลตอบแทนต่อปี และระยะเวลาลงทุน แสดงยอดปลายทาง กราฟ และตารางรายปี ใช้ React + TypeScript + Vite; ทำงานในเบราว์เซอร์โดยไม่ต้องมี backend

## ใช้งานบนเครื่อง

ต้องมี Node.js 24 ขึ้นไป

```sh
npm ci
npm run dev
```

เปิด URL ที่ Vite แสดงใน terminal (ปกติคือ `http://localhost:5173/`)

```sh
npm test
npm run lint
npm run build
```

## เงื่อนไขการคำนวณ

- อัตราต่อปีเป็นอัตรา nominal: คิดดอกเบี้ยรายเดือนด้วย `อัตราต่อปี / 12` จากยอดต้นเดือน แล้วฝากเพิ่มตอนสิ้นเดือน
- ปัดดอกเบี้ยเป็นสตางค์ในแต่ละเดือน ผลลัพธ์เป็นการประมาณ ไม่รวมภาษี ค่าธรรมเนียม และเงินเฟ้อ
- ใส่เงินต้นและเงินฝากรายเดือนได้ตั้งแต่ 0 บาท; ระยะเวลา 1–50 ปี; อัตรา 0–100% หากยอดสูงเกินความแม่นยำที่รองรับ เว็บจะแจ้งให้ลดค่า

## เผยแพร่บน GitHub Pages

1. สร้าง GitHub repository แล้ว push โค้ดขึ้น branch `main` (ให้มี `package-lock.json` ด้วย)
2. ที่ repository เปิด **Settings → Pages → Build and deployment → Source → GitHub Actions**
3. Workflow `Deploy to GitHub Pages` จะทดสอบและ build ก่อน deploy ทุกครั้งที่ push ไป `main` สามารถสั่งรันเองได้ที่แท็บ Actions
4. เว็บแบบ project repository จะอยู่ที่ `https://<username>.github.io/<repository>/` หากชื่อ repository เป็น `<username>.github.io` เว็บจะอยู่ที่ root ของโดเมน

Vite อ่าน `GITHUB_REPOSITORY` ตอน build ใน Actions เพื่อตั้ง asset base path อัตโนมัติ ในเครื่อง local ใช้ `/` ตามปกติ ไม่มี router จึง refresh หน้าเดียวได้โดยตรง