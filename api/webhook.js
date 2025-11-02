export default async function handler(req, res) {
  // POST만 허용
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const WEBHOOK_URL = process.env.DISCORD_WEBHOOK;
  if (!WEBHOOK_URL) {
    console.error("❌ DISCORD_WEBHOOK env not found");
    return res.status(500).json({ error: "Webhook not configured" });
  }

  const data = req.body || {};

  const fields = Object.keys(data).map((key) => {
    const raw = data[key];
    const safeValue =
      raw && String(raw).trim().length > 0 ? String(raw) : "미입력";

    return {
      name: key,
      value: safeValue,
      inline: false,
    };
  });

  // 접수한 IP (x-forwarded-for 있으면 그걸 우선 사용)
  const ip =
    (req.headers["x-forwarded-for"] &&
      req.headers["x-forwarded-for"].toString().split(",")[0].trim()) ||
    req.socket?.remoteAddress ||
    "알 수 없음";

  fields.push({
    name: "접수 IP",
    value: ip,
    inline: false,
  });

  const payload = {
    content: "📌 **한국도로공사 신규 지원서 도착**",
    embeds: [
      {
        title: "한국도로공사 지원서",
        color: 0x2b66ff, // 파란 포인트
        fields,
        footer: {
          text: "한국도로공사 지원 시스템",
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    const discordRes = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!discordRes.ok) {
      console.error("❌ Discord webhook error:", await discordRes.text());
      return res
        .status(500)
        .json({ error: "전송 실패 (디스코드 응답 오류)" });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("❌ Webhook exception:", err);
    return res.status(500).json({ error: "전송 실패 (예외 발생)" });
  }
}
