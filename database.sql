-- 建立最新消息、服務與法規資料庫 (announcements)
CREATE TABLE public.announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('news', 'services', 'regulations')),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 建立部落格文章資料庫 (blog_posts)
CREATE TABLE public.blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    content TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 建立線上申辦與報名資料庫 (applications)
CREATE TABLE public.applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    applicant_name TEXT NOT NULL,
    applicant_phone TEXT NOT NULL,
    project_name TEXT NOT NULL,
    details TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 啟用 Row Level Security (RLS) 安全防護
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- 1. announcements 權限設定：任何人皆可讀取，僅有管理員(後台)能編輯
CREATE POLICY "Allow public read-only access for announcements" 
ON public.announcements FOR SELECT USING (true);

-- 2. blog_posts 權限設定：任何人皆可讀取，僅有管理員(後台)能編輯
CREATE POLICY "Allow public read-only access for blog_posts" 
ON public.blog_posts FOR SELECT USING (true);

-- 3. applications 權限設定：
-- 允許登入會員新增自己的申辦資料
CREATE POLICY "Allow authenticated users to insert their own applications" 
ON public.applications FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- 允許登入會員查詢自己所送出的申辦資料
CREATE POLICY "Allow authenticated users to select their own applications" 
ON public.applications FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- 預填範例資料 (Seed Data)
INSERT INTO public.announcements (title, description, category, image_url) VALUES
('耐震評估講習會報名開始', '中華民國全國建築師公會將於下月舉辦耐震評估講習會，歡迎會員報名。', 'news', 'file:///Users/peipei/.gemini/antigravity/brain/27962213-518f-47e6-89cd-fabbfdae6a1b/card_news_1783578104259.jpg'),
('結構外審委託服務', '提供高層建築結構外審與專業技術諮詢服務，確保結構安全性。', 'services', 'file:///Users/peipei/.gemini/antigravity/brain/27962213-518f-47e6-89cd-fabbfdae6a1b/card_service_1783578130668.jpg'),
('都市更新與危老重建宣導', '協助社區進行危老建物安全鑑定與都更規劃流程。', 'services', 'file:///Users/peipei/.gemini/antigravity/brain/27962213-518f-47e6-89cd-fabbfdae6a1b/card_service_1783578130668.jpg'),
('115年度最新建築技術規則修訂', '轉知營建署公告之建築技術規則最新修訂條文，請會員特別留意。', 'regulations', 'file:///Users/peipei/.gemini/antigravity/brain/27962213-518f-47e6-89cd-fabbfdae6a1b/card_regulation_1783578245056.jpg');

INSERT INTO public.blog_posts (title, description, content, image_url) VALUES
('城市天際線的未來趨勢', '探討高層建築如何與永續設計結合，打造更健康的城市環境。', '隨著全球都市化程度攀升，城市天際線正迎來本世紀最顯著的變革。現代高層建築不再僅僅追求高度，而是將目光投向「永續設計」與「人本環境」的結合。透過綠化立面、雨水回收系統以及太陽能玻璃的整合，建築物正從原本的「能源消耗者」轉變為「能源生產者」。同時，木構造（Mass Timber）等新型建材的應用，也為高層建築的減碳之路開闢了新篇章。', 'file:///Users/peipei/.gemini/antigravity/brain/27962213-518f-47e6-89cd-fabbfdae6a1b/blog_post1_1783581005190.jpg'),
('藍圖與實踐：案例解析', '從概念圖到完成建築，觀察每個環節的挑戰與解決方案。', '一棟成功的建築往往誕生於無數次圖面的調整與現場的磨合。本案例聚焦於近年甫完工的清水模公共圖書館，解析設計團隊如何在有限的預算下，完美呈現清水模粗獷且典雅的質感。我們將從材料配比、模板拼接、蜂巢防範等實作工法切入，並分享如何在後期施工中解決結構載重與採光配置的衝突，為建築同行提供實務上的參考。', 'file:///Users/peipei/.gemini/antigravity/brain/27962213-518f-47e6-89cd-fabbfdae6a1b/blog_post2_1783581017985.jpg');
