// This waits for WorkAdventure to load your script via your URL
WA.onInit().then(async () => {
    console.log("WorkAdventure URL script connected! Spawning both assistants...");

    // 1. Put your actual Groq API key here (Starts with gsk_...)
    const GROQ_API_KEY = "YOUR_GROQ_API_KEY_HERE"; 

    if (GROQ_API_KEY === "YOUR_GROQ_API_KEY_HERE" || !GROQ_API_KEY) {
        console.error("CRITICAL: Remember to add your real Groq Key inside the code!");
        return;
    }

    // 2. Spawn Bot #1: The Researcher (Moves to x: 200, y: 200)
    const researcherBot = await WA.bot.spawnBot({
        name: "Llama Researcher",
        userId: "groq_bot_researcher",
        x: 200, 
        y: 200,
        character: "receptionist"
    });

    // 3. Spawn Bot #2: The Writer (Moves to x: 400, y: 200)
    const writerBot = await WA.bot.spawnBot({
        name: "Llama Writer",
        userId: "groq_bot_writer",
        x: 400,
        y: 200,
        character: "casual_guy"
    });

    console.log("Both characters have been requested on the map.");

    // 4. Watch the chat room and reply using Groq
    WA.chat.onChatMessage((message) => {
        let selectedBot = null;
        let systemRolePrompt = "";

        // Check who the player is whispering to or mentioning
        if (message.recipientId === "groq_bot_researcher") {
            selectedBot = researcherBot;
            systemRolePrompt = "You are a factual research assistant. Keep answers under two sentences.";
        } else if (message.recipientId === "groq_bot_writer") {
            selectedBot = writerBot;
            systemRolePrompt = "You are an energetic, creative copywriter.";
        }

        // Send data to Groq only if one of our bots was targeted
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
            .then(res => {
                if (!res.ok) throw new Error(`Groq API Error: ${res.status}`);
                return res.json();
            })
            .then(data => {
                // The correct bot speaks out loud in the room
                selectedBot.say(data.choices[0].message.content);
            })
            .catch(err => {
                selectedBot.say("Groq API connection failed.");
                console.error("Groq Error:", err);
            });
        }
    });

}).catch((err) => {
    console.error("WorkAdventure couldn't run the script:", err);
});
