const { Client } = require('bedrock-protocol');

// --- CONFIGURATION (YOUR SERVER DETAILS) ---
const config = {
  host: 'redbudsmp.aternos.me', // Your Aternos IP
  port: 31418,                  // Your Aternos Port
  username: 'mikooooooo162712', // Bot's gamertag (exactly 16 chars)
  offline: false                // Keep false for Aternos/Microsoft auth
};

// --- RANDOM PROMO MESSAGES (Add as many as you want!) ---
const promoMessages = [
  "🌈 Hey everyone! Join our Discord for events!",
  "🔥 SUB to the_guy-q2n on YouTube!",
  "💎 This bot is brought to you by the_guy-q2n!",
  "🎮 Need help? Just type !ping in chat!",
  "🚀 Running 24/7 thanks to Render!",
  "👑 the_guy-q2n is the best! Go subscribe!",
  "🌙 Good night gamers! (Or good morning!)",
  "🤖 Beep boop! I run on coffee and code.",
  "⚡️ Don't forget to check out the_guy-q2n's streams!",
  "📢 Sub to the_guy-q2n for epic Minecraft content!"
];

// --- BOT ENGINE ---
function startBot() {
  const client = new Client(config);
  let currentPos = { x: 0, y: 0, z: 0 }; // Tracks where the bot stands
  let isReady = false;

  // 1. TRACK REAL POSITION (so we don't walk into the void)
  client.on('move_player', (packet) => {
    if (packet.mode === 0) { // Normal movement update
      currentPos.x = packet.x;
      currentPos.y = packet.y;
      currentPos.z = packet.z;
    }
  });

  // 2. WHEN BOT SUCCESSFULLY JOINS
  client.on('start', () => {
    isReady = true;
    console.log(`✅ ${config.username} has joined the server!`);
    client.queue('chat', { message: 'Hello! I am the 24/7 guardian bot.' });

    // --- RANDOM PROMO CHAT (every 2 minutes) ---
    setInterval(() => {
      if (!isReady) return;
      const randomMsg = promoMessages[Math.floor(Math.random() * promoMessages.length)];
      client.queue('chat', { message: randomMsg });
      console.log(`💬 Promo sent: ${randomMsg}`);
    }, 120000); // 120,000 ms = 2 minutes

    // --- ATERNOS KEEP-ALIVE: Circle Walk (every 15 seconds) ---
    let tick = 0;
    setInterval(() => {
      if (!isReady) return;
      tick++;
      if (tick % 15 === 0) { // Walk in a circle every 15 seconds
        const radius = 2.5;
        const angle = tick / 5;
        const newX = currentPos.x + Math.sin(angle) * radius;
        const newZ = currentPos.z + Math.cos(angle) * radius;

        client.queue('move_player', {
          x: newX,
          y: currentPos.y, // Uses the REAL Y coordinate so it doesn't fall
          z: newZ,
          pitch: 0,
          yaw: (angle * (180 / Math.PI)) % 360,
          mode: 0, // Normal movement
          on_ground: true
        });
        console.log(`🏃‍♂️ Walking circle (X: ${newX.toFixed(2)}, Z: ${newZ.toFixed(2)})`);
      }
    }, 1000); // Checks every second

    // --- ANTI-AFK: Swing Arm (every 4 seconds) ---
    setInterval(() => {
      if (!isReady) return;
      client.queue('animate', {
        action: 1, // Swing arm
        runtime_entity_id: client.riot?.user_id || 0
      });
    }, 4000);
  });

  // 3. CHAT COMMANDS (Players can interact with the bot)
  client.on('text', (packet) => {
    console.log(`💬 Chat: ${packet.message}`);
    
    if (packet.message.includes('!ping')) {
      client.queue('chat', { message: '🏓 Pong! Fast and furious!' });
    }
    
    if (packet.message.includes('!promo')) {
      const promo = promoMessages[Math.floor(Math.random() * promoMessages.length)];
      client.queue('chat', { message: `📢 ${promo}` });
    }

    if (packet.message.includes('!help')) {
      client.queue('chat', { message: '📋 Commands: !ping, !promo' });
    }
  });

  // 4. AUTO-RECONNECT (If kicked or server restarts)
  client.on('close', (reason) => {
    isReady = false;
    console.log(`❌ Disconnected: ${reason || 'Unknown'}. Rejoining in 5 seconds...`);
    setTimeout(startBot, 5000);
  });

  // 5. ERROR HANDLING
  client.on('error', (err) => {
    console.error('⚠️ Client Error:', err.message);
  });
}

// --- LAUNCH THE BOT ---
startBot();
