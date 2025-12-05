import { createClient } from '@supabase/supabase-js';

const url = "https://hqhblxxqsaasywkgqzft.supabase.co";
const key = "sb_secret_07Bf6k1oJCZcbO-qwPHsxA_hyu7uLYa";

const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.from('fortune_logs').insert({
    name: "TestUser",
    gender: "male",
    birth_date: "2000-01-01",
    birth_time: "12:00",
    birthplace: "北京",
    recent_event: "测试写入",
    question: "测试",
    year_pillar: "甲子",
    month_pillar: "乙丑",
    day_pillar: "丙寅",
    hour_pillar: "丁卯",
    analysis_text: "测试内容",
    bazi_meta: {}
  });

  console.log("data:", data);
  console.log("error:", error);
}

test();
