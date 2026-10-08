require('dotenv').config();
keepAlive();
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;
const FIVEM_SERVER = process.env.FIVEM_SERVER;
const SERVER_NAME = process.env.SERVER_NAME || 'Serveur FiveM';
const INTERVAL = Math.max(parseInt(process.env.UPDATE_INTERVAL, 10) || 30, 15) * 1000;

if (!TOKEN || !FIVEM_SERVER) {
  console.error('❌ DISCORD_TOKEN et FIVEM_SERVER doivent être définis dans le fichier .env');
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Récupère un JSON depuis le serveur FiveM avec un timeout
async function fetchJson(path) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`http://${FIVEM_SERVER}/${path}`, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function updatePresence() {
  try {
    const [players, info] = await Promise.all([
      fetchJson('players.json'),
      fetchJson('info.json'),
    ]);

    const current = players.length;
    const max = info?.vars?.sv_maxClients || '?';

    client.user.setPresence({
      status: 'online',
      activities: [
        {
          name: `${SERVER_NAME} • ${current}/${max} joueurs`,
          type: ActivityType.Watching,
        },
      ],
    });
    console.log(`✅ Statut mis à jour : ${current}/${max} joueurs`);
  } catch (err) {
    console.warn(`⚠️ Serveur injoignable (${err.message})`);
    client.user.setPresence({
      status: 'dnd',
      activities: [
        {
          name: `${SERVER_NAME} • Hors ligne`,
          type: ActivityType.Watching,
        },
      ],
    });
  }
}

client.once('ready', () => {
  console.log(`🤖 Connecté en tant que ${client.user.tag}`);
  updatePresence();
  setInterval(updatePresence, INTERVAL);
});

client.login(TOKEN);
