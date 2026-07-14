# 中華民國全國建築師公會首頁改版設計方案 (Redesign Proposal)

本設計方案針對 [中華民國全國建築師公會](https://www.naa.org.tw/) 首頁進行改版規劃。本次改版特別參考了 [臺中市建築師公會](https://www.tccarch.org.tw/related.php?GroupNo=58) 的視覺美學與排版特徵，結合**Z型佈局**、**卡片網格系統**與**瞇瞇眼測試 (Squint Test)**，打造兼具現代感與高易用性的建築專業網站。

---

## 一、 參考設計特徵分析 (TCCARCH Design Reference)

我們借鑒了臺中市建築師公會（TCCARCH）在內容頁面上的優點，並將其融入本次首頁的改造：

1. **模組化網格卡片系統 (Grid Card System)**：
   * **特色**：採用固定比例（如 `268x158` 或 `16:9`）的縮圖容器（`dt`），將各公會標誌或服務圖示置中，下方搭配對齊的純文字標題（`dd`）。整體排版工整，極具視覺秩序。
   * **改造應用**：首頁的「服務專區」與「法規卡片」拋棄現有的混亂色塊與高度不一的卡片，改用此種**等寬等高、帶有細緻投影的網格卡片**，並賦予卡片優雅的 `fadeIn` 懸停上浮動畫，提升空間立體感。
2. **快速分類選擇器 (Category Switcher)**：
   * **特色**：在卡片網格上方置入簡潔的下拉式選單（`select`）或水平標籤組（Tab Pills），讓使用者在不用重載頁面的情況下，快速切換分類（如：合作網站、證照相關、友會連結、請照相關）。
   * **改造應用**：在首頁最新消息與公告區上方，置入精緻的「分類快速過濾器」，減少首頁塞滿所有資訊的混亂度，提供順暢的使用者自定義瀏覽體驗。
3. **品牌視覺橫幅與典雅標題 (Sub-banner & Classic Headers)**：
   * **特色**：主視覺下方或內頁頂部使用大氣的建築攝影橫幅（Banner），並配合簡潔的兩端橫線裝飾標題（如：`— 友會連結 —`），營造沉穩、專業的行業氣氛。
   * **改造應用**：首頁各版塊標題改用此種極簡裝飾線排版，如 `— 服務專區 —` 與 `— 最新焦點 —`，並使用襯線體字型，呼應建築設計的優雅本質。

---

## 二、 網頁視覺與易用性分析表 (Redesign Audit)

| 維度 | 現狀分析 (Current Site) | 借鑒台中公會改版方案 (Redesigned with TCCARCH Style) |
| :--- | :--- | :--- |
| **1. 顏色 (Color)** | 色彩計畫紊亂，淡藍、深灰、黑白交錯，紅色 `【本會活動】` 字樣突兀。 | 統一使用**清水混凝土灰 (Slate Gray, `#E2E8F0`)** 與**深岩灰藍 (Charcoal Blue, `#1E293B`)** 為主色調。點綴色採用**鐵鏽紅 (Rust-Orange, `#E05A47`)** 導流至核心 CTA，並在卡片背景使用極簡亮灰與白色微漸層。 |
| **2. 對比 (Contrast)** | 輪播圖文字遮罩不足，服務卡片文字對比偏低。 | 採用 TCCARCH 的高對比實色文字卡片排版。文字與背景維持在 WCAG AA 級以上高對比，確保在各類螢幕下均有完美的閱讀體驗。 |
| **3. 大小 (Size)** | 搜尋按鈕過大，首頁文字公告大小層級不明顯。 | 導入嚴格的字級比例。主視覺標語為 `3rem` 以上大字，網格卡片標題為 `1.1rem`，並將主要的線上申辦 CTA 按鈕放大 1.5 倍，使其具備絕對視覺主導權。 |
| **4. 明暗 (Light/Dark)** | 橫向背景條紋感強烈，視覺動線破碎。 | 使用一致的亮色/清水模背景。透過卡片邊框的**極細深灰色線條**與**懸停微投影**（Soft Shadow）創造元件的明暗深度與堆疊層次。 |
| **5. 密度 (Density)** | 資訊極度擁擠，九大服務、最新公告、花絮堆疊，缺乏留白。 | **引進 TCCARCH 的卡片式網格**，卡片之間保留 `24px` 的呼吸感通道。將次要的活動花絮與法規下載整合成 Tab 卡片滑動模組，減少頁面垂直拉伸感。 |
| **6. 複雜度 (Complexity)** | 入口繁雜，沒有分流機制，搜尋與各按鈕競爭焦點。 | **精簡化功能結構**。頂部左上 Logo、右上選單；中部大型標語；下方為「最新公告過濾器」與「六大服務網格」，引導動線清晰分明。 |

---

## 三、 Z型佈局與視覺引導規劃 (Z-Pattern Layout & Visual Flow)

本改版網頁結構遵循 **Z型佈局 (Z-Pattern Layout)**，確保視覺流暢並引導會員轉化：

1. **起點 (左上 - Zone A)**：中華民國全國建築師公會（NAA）簡約高對比 Logo。
2. **第一橫向軌跡 (至右上 - Zone B)**：極簡導航選單 + **【會員快捷登入】次要 CTA 按鈕**（高雅細邊框設計）。
3. **斜對角視覺線 (至左下 - Zone C)**：
   * **Hero Section**：中央印有巨大高對比粗體字標語：**「以建築之名，築起時代的深度」**。
   * **最新公告區**：引入 TCCARCH 的「分類快速過濾器」，供會員一鍵切換本會活動、公文與講習報名。
4. **第二橫向軌跡 (至右下 - Zone D - 終點)**：
   * **核心 CTA**：**【立即線上報名與申辦】** 按鈕。
   * **設計與瞇瞇眼測試 (Squint Test)**：當瞇起眼睛、畫面模糊時，整張頁面由乾淨的灰白網格與清水模材質構成，此時位於右下角、色彩高飽和度（鐵鏽紅或建築暖金）且帶有顯著陰影的 **【立即線上報名與申辦】** 按鈕，會成為最亮眼的點，視覺引導極為成功。

---

## 四、 首頁線框結構圖 (Wireframe Block Diagram)

以下是融合台中公會卡片網格與 Z 型排版的新首頁結構：

```
+-------------------------------------------------------------------------+
| [NAA Logo]                     最新消息  法規專區  服務專區  [會員快捷登入]  | -> (Zone A 至 Zone B)
+-------------------------------------------------------------------------+
|                                                                         |
|            「 以 建 築 之 名 ， 築 起 時 代 的 深 度 」                    |
|                                                                         |
|                                         [ 立即線上報名與申辦 -> ]       | -> (Zone D 核心 CTA)
|                                                                         |
+-------------------------------------------------------------------------+
|                         — 最新公告與法令速遞 —                           |
|  過濾分類: [ 全部消息 ] ( 本會活動 ) ( 本會公文 ) ( 講習訊息 )           | -> (分類選擇器)
|  ---------------------------------------------------------------------  |
|  * 115-07-09 【本會活動】耐震講習會報名開始                              |
|  * 115-07-06 【代轉活動】工程金質獎受理推薦中                            |
|  * 115-06-29 【轉知公文】無障礙實務講習說明會                            |
+-------------------------------------------------------------------------+
|                              — 服務專區 —                               | -> (TCCARCH 卡片網格佈局)
|  +-------------------+  +-------------------+  +-------------------+    |
|  |     (圖示/Logo)   |  |     (圖示/Logo)   |  |     (圖示/Logo)   |    |
|  |      結構外審     |  |      鑑定服務     |  |      都更危老     |    |
|  +-------------------+  +-------------------+  +-------------------+    |
|  +-------------------+  +-------------------+  +-------------------+    |
|  |     (圖示/Logo)   |  |     (圖示/Logo)   |  |     (圖示/Logo)   |    |
|  |      BIM 技術     |  |    耐震標章認證   |  |    綠建築系統     |    |
|  +-------------------+  +-------------------+  +-------------------+    |
+-------------------------------------------------------------------------+
| Footer: 中華民國全國建築師公會 | 聯絡方式 | 友會連結                      |
+-------------------------------------------------------------------------+
```

---

## 五、 AI 圖像生成提示詞 (AI Prompts for Mockup)

你可以使用以下提示詞在 Midjourney 中生成符合此設計概念的網頁 Mockup：

### 提示詞 1：清水模與高對比網格卡片風 (Concrete & Card-Grid Architecture Style)
> **英文 Prompt**:
> `UI/UX design of a premium homepage mockup for the National Association of Architects, desktop web version, Z-pattern layout. Clean concrete-gray and off-white background with charcoal text. Large hero typography: "以建築之名，築起時代的深度". Below the hero, there is a beautifully aligned 3x2 grid of service cards. Each card has a minimal graphic logo on top (16:9 ratio) and clean title text below, mimicking high-end architectural studio portfolios. Top-right navigation has a clean gray login button. In the bottom-right terminal area, there is an extremely prominent, vibrant rust-orange (#E05A47) CTA button labeled "Online Portal". High contrast, clean layout, lots of negative space, elegant and modern, squint-test friendly. --ar 16:9 --v 6.0`

### 提示詞 2：極簡白與經典建築邊框風 (Minimalist White with Classic Borders)
> **英文 Prompt**:
> `A premium minimalist web design mockup of the National Association of Architects homepage. White and slate-gray theme, inspired by elegant architecture studio websites. Clean Z-pattern layout. Centered thin-line headers with decorative dashes like "— Services —". Includes a category dropdown select box, followed by a clean grid of logo-cards on light gray background boxes with subtle drop shadows and crisp border lines. The terminal action button in the bottom right is a glowing, vibrant architectural amber gold (#D4AF37) CTA button. High contrast, clean visual hierarchy, visual flow, dnd, flat design, --ar 16:9`
