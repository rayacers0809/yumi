export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const data = req.body;

  // ⚠️ 웹훅 URL은 절대 코드에 직접 넣지 말고 환경변수로 관리!
  const WEBHOOK_URL = process.env.DISCORD_WEBHOOK;

  const fields = Object.keys(data).map((key) => ({
    name: key,
    value: data[key] || "https://discord.com/api/webhooks/1422590075127992503/v3fHLW3D4pTFjxxdPgXBTKbyOLgr1WylVOcO6IlzT7GuTAEWBt1UprPLwcO65EDk3bkD",
    inline: false,
  }));

  const payload = {
    content: "📌 **새로운 YUMI 팩션 지원서가 도착했습니다!**",
    embeds: [
      {
        title: "🌸 YUMI 팩션 지원서",
        color: 0xff9ecd,
        fields,
        footer: { text: "YUMI 지원 시스템" },
        timestamp: new Date(),
      },
    ],
  };

  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ error: "전송 실패" });
  }
}
