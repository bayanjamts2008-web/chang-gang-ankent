// Vercel serverless function: receives an application and posts it to Discord.
// Needs the environment variable DISCORD_WEBHOOK_URL (set in Vercel → Settings → Environment Variables).

const cut = (v, n = 1000) => {
  const s = String(v ?? "").trim();
  return s.length > n ? s.slice(0, n - 1) + "…" : s || "-";
};
const bar = (n) => {
  const v = Math.max(0, Math.min(10, Number(n) || 0));
  return "▰".repeat(v) + "▱".repeat(10 - v) + `  **${v}/10**`;
};

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const hook = process.env.DISCORD_WEBHOOK_URL;
  if (!hook) return res.status(500).json({ error: "DISCORD_WEBHOOK_URL тохируулаагүй байна" });

  let a = req.body;
  if (typeof a === "string") { try { a = JSON.parse(a); } catch { a = null; } }
  if (!a || typeof a !== "object") return res.status(400).json({ error: "Буруу өгөгдөл" });
  if (a.website) return res.status(200).json({ ok: true }); // bot trap
  if (!a.ic || !a.discord || !a.age) return res.status(400).json({ error: "Дутуу мэдээлэл" });

  const quiz = Number(a.quizScore) || 0;
  const color = quiz >= 4 ? 0x4fd18b : quiz >= 3 ? 0xf29a3a : 0xff5c6c;

  const embed = {
    title: `🔫 ${cut(a.ic, 200)}`,
    description: `**${cut(a.gang || "Chang gang", 80)}** — шинэ элсэлтийн анкет`,
    color,
    fields: [
      { name: "Discord", value: cut(a.discord, 100), inline: true },
      { name: "Нас", value: cut(a.age, 10), inline: true },
      { name: "Дүрмийн шалгалт", value: `**${quiz}/5**`, inline: true },
      { name: "FiveM цаг", value: cut(a.hours, 50), inline: true },
      { name: "Сервер дээр", value: cut(a.since, 50), inline: true },
      { name: "Бан / warn", value: cut(a.ban, 50), inline: true },
      { name: "🎯 Буудлага", value: bar(a.aim) },
      { name: "🚗 Жолоо", value: bar(a.drive) },
      { name: "🎭 RP", value: bar(a.rp) },
      { name: "Зэвсэг", value: cut(a.weapon, 50), inline: true },
      { name: "Микрофон", value: cut(a.mic, 50), inline: true },
      { name: "Хэл", value: cut(a.lang, 50), inline: true },
      { name: "Тоглох цаг", value: cut(Array.isArray(a.times) ? a.times.join(", ") : a.times, 200) },
      { name: "Харилцааны дутагдал", value: cut(a.comm, 500) },
      { name: "Өмнөх бүлэг", value: cut(a.prev, 500) },
      { name: "Найз баригдвал", value: cut(a.sc1, 700) },
      { name: "Өөр ганг доромжилбол", value: cut(a.sc2, 700) },
      { name: "Яагаад элсэх гэж байгаа", value: cut(a.why, 700) },
    ],
    footer: { text: "✅ авах · ❌ татгалзах · ⏳ туршилтад" },
    timestamp: new Date().toISOString(),
  };
  if (a.clip) embed.fields.push({ name: "Клип", value: cut(a.clip, 300) });

  try {
    const r = await fetch(hook + (hook.includes("?") ? "&" : "?") + "wait=true", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Chang gang Элсэлт",
        embeds: [embed],
        allowed_mentions: { parse: [] },
      }),
    });
    if (!r.ok) return res.status(502).json({ error: "Discord руу илгээж чадсангүй" });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(502).json({ error: "Discord руу илгээж чадсангүй" });
  }
};
