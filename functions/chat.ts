import { serve } from 'https://deno.land/std/http/server.ts'

serve(async (req) => {
  const { message } = await req.json()
  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer YOUR_OPENAI_KEY",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: message }],
      max_tokens: 100
    })
  })

  const result = await openaiRes.json()
  return new Response(JSON.stringify({ reply: result.choices?.[0]?.message?.content }), {
    headers: { "Content-Type": "application/json" }
  })
})
