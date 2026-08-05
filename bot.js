const { Client } = require('bedrock-protocol');
const http = require('http'); // 👈 Web server to keep Render awake

// --- CONFIGURATION ---
const config = {
  host: 'redbudsmp.aternos.me',
  port: 31418,
  username: 'mikooooooo162712',
  offline: false
};

// --- PROMO MESSAGES ---
const promoMessages = [
  "🌈 Hey everyone! Join our Discord for events!",
  "🔥 SUB to the_guy-q2n on YouTube!",
  "💎 This bot is brought to you by the_guy-q2n!",
  "🎮 Need help? Just type !ping in chat!",
  "🚀 Running 24/7 thanks to Render!",
  "👑 the_guy-q2n is the best! Go subscribe!",
  "🤖 Beep boop! I run on coffee and code.",
  "⚡️ Don't forget to check out the_guy-q2n's streams!"
];

// --- BOT ENGINE ---
function startBot() {
  const client = new Client(config);
  let currentPos = { x: 0, y: 0, z: 0 };
  let isReady = false;

  client.on('move_player', (packet) => {
    if (packet.mode === 0) {
      currentPos.x = packet.x;
      currentPos.y = packet.y;
      currentPos.z = packet.z;
    }
  });

  client.on('start', () => {
    isReady = true;
    console.log(`✅ ${config.username} has joined the server!`);
    client.queue('chat', { message: 'Hello! I am the 24/7 guardian bot.' });

    // Promo messages every 2 minutes
    setInterval(() => {
      if (!isReady) return;
      const randomMsg = promoMessages[Math.floor(Math.random() * promoMessages.length)];
      client.queue('chat', { message: randomMsg });
      console.log(`💬 Promo sent: ${randomMsg}`);
    }, 120000);

    // Aternos keep-alive: Circle walk
    let tick = 0;
    setInterval(() => {
      if (!isReady) return;
      tick++;
      if (tick % 15 === 0) {
        const radius = 0.5; // Tiny shuffle to avoid modded blocks
        const angle = tick / 5;
        const newX = currentPos.x + Math.sin(angle) * radius;
        const newZ = currentPos.z + Math.cos(angle) * radius;

        client.queue('move_player', {
          x: newX,
          y: currentPos.y,
          z: newZ,
          pitch: 0,
          yaw: (angle * (180 / Math.PI)) % 360,
          mode: 0,
          on_ground: true
        });
      }
    }, 1000);

    // Anti-AFK: Swing arm
    setInterval(() => {
      if (!isReady) return;
      client.queue('animate', {
        action: 1,
        runtime_entity_id: client.riot?.user_id || 0
      });
    }, 4000);
  });

  // Chat commands
  client.on('text', (packet) => {
    if (packet.message.includes('!ping')) {
      client.queue('chat', { message: '🏓 Pong!' });
    }
    if (packet.message.includes('!promo')) {
      const promo = promoMessages[Math.floor(Math.random() * promoMessages.length)];
      client.queue('chat', { message: `📢 ${promo}` });
    }
    if (packet.message.includes('!help')) {
      client.queue('chat', { message: '📋 Commands: !ping, !promo' });
    }
  });

  client.on('close', (reason) => {
    isReady = false;
    console.log(`❌ Disconnected: ${reason}. Rejoining in 5s...`);
    setTimeout(startBot, 5000);
  });

  client.on('error', (err) => {
    console.error('⚠️ Client Error:', err.message);
  });
}

// --- WEB SERVER (KEEPS RENDER AWAKE) ---
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('✅ Bot is alive and running!');
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
  console.log(`🤖 Starting Minecraft bot...`);
  startBot(); // Start the bot AFTER the web server is up
});
