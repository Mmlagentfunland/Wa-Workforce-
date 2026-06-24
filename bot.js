WA.onInit().then(async () => {
    console.log("⚡ [WA Bot] Script successfully injected into map!");

    const GROQ_API_KEY = "YOUR_GROQ_API_KEY_HERE"; 

    if (GROQ_API_KEY === "YOUR_GROQ_API_KEY_HERE" || !GROQ_API_KEY) {
        console.error("❌ [WA Bot] CRITICAL ERROR: Groq Key is missing inside the script!");
        return;
    }

    console.log("🤖 [WA Bot] Attempting to spawn BOTH characters side-by-side...");

    // Create both bots simultaneously so WorkAdventure doesn't drop the second one
    const spawnRequests = [
        WA.bot.spawnBot({
            name: "Llama Researcher",
            userId: "groq_bot_researcher_v2", // Changed ID to avoid naming conflicts
            x: 200, 
            y: 200,
            character: "receptionist"
        }).then(bot => {
            console.log("✅ [WA Bot] Researcher spawned successfully!");
            return bot;
        }).catch(err => {
            console.error("❌ [WA Bot] Researcher failed to spawn:", err);
            return null;
        }),

        WA.bot.spawnBot({
            name: "Llama Writer",
            userId: "groq_bot_writer_v2", // Changed ID to avoid naming conflicts
            x: 250, // Moved closer to x:200 so they stand near each other
            y: 200,
            character: "casual_guy"
        }).then(bot => {
            console.log("✅ [WA Bot] Writer spawned successfully!");
            return bot;
        }).catch(err => {
            console.error("❌ [WA Bot] Writer failed to spawn:", err);
            return null;
        })
    ];

    // Wait for both spawn attempts to resolve
    const [researcherBot, writerBot] = await Promise.all(spawnRequests);

    // Chat router
    WA.chat.onChatMessage((message) => {
        let selectedBot = null;
        let systemRolePrompt = "";

        if (message.recipientId === "groq_bot_researcher_v2" && researcherBot) {
            selectedBot = researcherBot;
            systemRolePrompt = "You are a factual research assistant. Keep answers under two sentences.";
        } else if (message.recipientId === "groq_bot_writer_v2" && writerBot) {
            selectedBot = writerBot;
            systemRolePrompt = "You are an energetic, creative copywriter.";
        }

        if (selectedBot) {
            fetch("https://groq.com", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant", 
                    messages: [
                        { role: "system", content: systemRolePrompt },
                        { role: "user", content: message.text }
                    ]
                })
            })
            .then(res => res.json())
            .then(data => {
                selectedBot.say(data.choices[0].message.content);
            })
            .catch(err => console.error("Groq Error:", err));
        }
    });

}).catch((err) => {
    console.error("❌ [WA Bot] Script failed to launch entirely:", err);
});
