// This waits for the map to load, bypassing the dashboard entirely!
WA.onInit().then(async () => {
    console.log("Map loaded! Deploying the office team...");

    // Array of your bot configuration settings
    const officeCrew = [
        { name: "Receptionist Alice", skin: "receptionist", x: 150, y: 150 },
        { name: "Developer Bob", skin: "casual_guy", x: 200, y: 150 },
        { name: "Manager Charlie", skin: "gandalf", x: 250, y: 150 },
        { name: "Intern Daisy", skin: "receptionist", x: 300, y: 150 }
    ];

    // Loop through and spawn every single one of them side-by-side
    for (const member of officeCrew) {
        try {
            await WA.bot.spawnBot({
                name: member.name,
                userId: `office_${member.name.toLowerCase().replace(" ", "_")}`,
                x: member.x,
                y: member.y,
                character: member.skin
            });
            console.log(`Successfully spawned ${member.name}`);
        } catch (err) {
            console.error(`Failed to spawn ${member.name}:`, err);
        }
    }
});
