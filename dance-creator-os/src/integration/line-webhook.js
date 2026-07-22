/**
 * LINE Bot Messaging API Webhook Server (Express Stub)
 * 
 * 專門處理 LINE 官方帳號與學員前端互動的 Webhook 核心邏輯
 * 包含 Rich Menu 圖文選單點擊回傳與自動化課前提醒推播模組
 */

import express from 'express';
import { supabase } from '../shared/supabase.js';

const app = express();
app.use(express.json());

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || 'YOUR_ACCESS_TOKEN';

// Webhook endpoint receiver
app.post('/webhook/line', async (req, res) => {
  const events = req.body.events;
  if (!events) {
    return res.status(200).send('OK');
  }

  for (const event of events) {
    const userId = event.source.userId;

    if (event.type === 'message') {
      const text = event.message.text;
      
      // Auto-reply routing rules
      if (text === '約課' || text === '線上約課') {
        await replyLineMessage(event.replyToken, [
          {
            type: 'text',
            text: '親愛的學員你好 🔥！點擊下方連結即可查看本週課表並直接進行預約付款喔：\n👉 https://laipei0725-del.github.io/web.test.agent.opendesign2026/dance-creator-os/src/portal/index.html'
          }
        ]);
      } else if (text === '查詢剩餘堂數') {
        // Query Supabase student points dynamically by LINE userId
        const points = await getStudentPointsByLineId(userId);
        await replyLineMessage(event.replyToken, [
          {
            type: 'text',
            text: `您目前帳戶剩餘額度為：${points} 堂。要繼續約課或加購，可以直接告訴我喔 💃！`
          }
        ]);
      } else {
        // Forward user message to Dashboard EventBus for live agent chat room notifications
        await forwardMessageToDashboardCRM(userId, text);
      }
    } else if (event.type === 'postback') {
      // Handles Rich Menu (圖文選單) button triggers
      const data = event.postback.data;
      if (data === 'action=book') {
        await replyLineMessage(event.replyToken, [
          {
            type: 'text',
            text: '已為您打開預約系統，請點選以下連結前往約課：\n👉 https://laipei0725-del.github.io/web.test.agent.opendesign2026/dance-creator-os/src/portal/index.html'
          }
        ]);
      }
    }
  }

  res.status(200).send('OK');
});

// Helper to push message to LINE API
async function replyLineMessage(replyToken, messages) {
  try {
    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
      },
      body: JSON.stringify({ replyToken, messages })
    });
  } catch (err) {
    console.error('Failed to post reply to LINE API:', err);
  }
}

// Fetch remaining points from Supabase CRM
async function getStudentPointsByLineId(lineUserId) {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('points_remaining')
      .eq('line_user_id', lineUserId)
      .single();
    if (error || !data) return 0;
    return data.points_remaining;
  } catch (err) {
    return 0;
  }
}

// Forward to Admin Dashboard via messages table insert (real-time subscribed)
async function forwardMessageToDashboardCRM(lineUserId, text) {
  try {
    await supabase.from('messages').insert([
      {
        channel: 'line',
        sender_id: lineUserId,
        text_content: text,
        created_at: new Date()
      }
    ]);
  } catch (err) {
    console.error('Failed to forward LINE message to Supabase:', err);
  }
}

// Automated scheduler runner for sending class reminders (Cron job triggerable)
export async function sendClassReminders() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDateStr = tomorrow.toISOString().substring(0, 10); // yyyy-mm-dd
  
  // Find bookings scheduled for tomorrow
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, students(line_user_id, name), courses(title, time_slot)')
    .eq('date', tomorrowDateStr);

  if (!bookings) return;

  for (const booking of bookings) {
    const lineId = booking.students?.line_user_id;
    if (!lineId) continue;

    // Send push message alert
    try {
      await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          to: lineId,
          messages: [
            {
              type: 'text',
              text: `💃 課前一天提醒！\n親愛的 ${booking.students.name}，您明天有預約的舞蹈課程：\n📚 課程：${booking.courses.title}\n⏰ 時段：${booking.courses.time_slot}\n記得準時抵達教室 Studio 喔！🔥`
            }
          ]
        })
      });
    } catch (err) {
      console.error('Failed to send automated push notification:', err);
    }
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`LINE Webhook Server running on port ${PORT}`);
});
