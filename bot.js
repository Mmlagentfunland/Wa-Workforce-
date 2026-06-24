async function initializeGroqBots() {
    // 1. Asks for your Groq API Key (starts with gsk_...)
    const groqKey = prompt("Please enter your Groq API Key to activate the Llama 8B bots:");
    
    if (!groqKey) {
        console.error("No key provided. Bots are sitting idle.");
        return;
    }

    // Spawn Bot #1: The Researcher
    const researcherBot = await WA.bot.spawnBot({
        name: "Llama Researcher",
        userId: "groq_bot_researcher",
        x: 200, 
        y: 200,
        character: "receptionist"
    });

    // Spawn Bot #2: The Writer
    const writerBot = await WA.bot.spawnBot({
        name: "Llama Writer",
        userId: "groq_bot_writer",
        x: 400,
        y: 200,
        character: "casual_guy"
    });

    // Listen for chat triggers
    WA.chat.onChatMessage((message) => {
        let selectedBot = null;
        let systemRolePrompt = "";

        if (message.recipientId === "groq_bot_researcher") {
            selectedBot = researcherBot;
            systemRolePrompt = "You are a factual research assistant. Keep answers under two sentences.";
        } else if (message.recipientId === "groq_bot_writer") {
            selectedBot = writerBot;
            systemRolePrompt = "You are an energetic, creative copywriter.";
        }

        if (selectedBot) {
            // Target the Groq Cloud endpoint directly
            fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${groqKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant", // Triggers Meta's Llama 8B model via Groq
                    messages: [
                        { role: "system", content: systemRolePrompt },
                        { role: "user", content: message.text }
                    ]
                })
            })
            .then(res => {
                if (!res.ok) throw new Error(`Groq Error Status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                // Return Groq's answer directly back into the WorkAdventure room
                selectedBot.say(data.choices[0].message.content);
            })
            .catch(err => {
                selectedBot.say("Groq API connection failed. Check your browser console log.");
                console.error(err);
            });
        }
    });
}

initializeGroqBots();
