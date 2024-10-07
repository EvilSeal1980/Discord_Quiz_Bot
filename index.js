import { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables from .env file
dotenv.config();

const TOKEN = process.env.CLIENT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

// Create a new Discord client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions] });

// Load questions from a JSON file
const questions = JSON.parse(fs.readFileSync('./questions.json', 'utf-8'));

console.log(`Token: ${TOKEN}, Client ID: ${CLIENT_ID}, Guild ID: ${GUILD_ID}`);

// Commands for the bot
const commands = [
  {
    name: 'startquiz',
    description: 'Start a quiz',
  },
  {
    name: 'leaderboard',
    description: 'Show the leaderboard',
  },
];

// Register commands using Discord's REST API
const rest = new REST({ version: '10' }).setToken(TOKEN);

async function registerCommands() {
  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
}

// Initialize scores object
const scores = {};

// Start the quiz
async function startQuiz(channel) {
  const questionObj = questions[Math.floor(Math.random() * questions.length)];

  switch (questionObj.type) {
    case 'multipleChoice':
      await askMultipleChoiceQuestion(channel, questionObj);
      break;
    case 'trueFalse':
      await askTrueFalseQuestion(channel, questionObj);
      break;
    case 'shortAnswer':
      await askShortAnswerQuestion(channel, questionObj);
      break;
  }
}

// Ask a multiple-choice question
async function askMultipleChoiceQuestion(channel, questionObj) {
  const { question, choices, correctAnswer } = questionObj;

  const embed = new EmbedBuilder()
    .setTitle(question)
    .setDescription(choices.map((choice, index) => `${index + 1}) ${choice}`).join('\n'))
    .setColor('#00FF00');

  const message = await channel.send({ embeds: [embed] });

  const emojiNumbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];
  for (let i = 0; i < choices.length; i++) {
    await message.react(emojiNumbers[i]);
  }

  const filter = (reaction, user) => emojiNumbers.includes(reaction.emoji.name) && !user.bot;
  const collector = message.createReactionCollector({ filter, time: 15000 });

  collector.on('collect', (reaction, user) => {
    const userAnswer = emojiNumbers.indexOf(reaction.emoji.name) + 1;
    if (userAnswer === correctAnswer) {
      channel.send(`${user.username} answered correctly!`);
      updateScore(user.id);
    } else {
      channel.send(`${user.username} answered incorrectly.`);
    }
  });

  collector.on('end', collected => {
    console.log(`Collected ${collected.size} reactions.`);
  });
}

// Ask a true/false question
async function askTrueFalseQuestion(channel, questionObj) {
  const { question, correctAnswer } = questionObj;

  const embed = new EmbedBuilder()
    .setTitle(question)
    .setDescription('React with 👍 for True or 👎 for False.')
    .setColor('#00FF00');

  const message = await channel.send({ embeds: [embed] });

  await message.react('👍');
  await message.react('👎');

  const filter = (reaction, user) => ['👍', '👎'].includes(reaction.emoji.name) && !user.bot;
  const collector = message.createReactionCollector({ filter, time: 15000 });

  collector.on('collect', (reaction, user) => {
    const userAnswer = reaction.emoji.name === '👍';
    if (userAnswer === correctAnswer) {
      channel.send(`${user.username} answered correctly!`);
      updateScore(user.id);
    } else {
      channel.send(`${user.username} answered incorrectly.`);
    }
  });

  collector.on('end', collected => {
    console.log(`Collected ${collected.size} reactions.`);
  });
}

// Ask a short-answer question
async function askShortAnswerQuestion(channel, questionObj) {
  const { question, acceptableAnswers } = questionObj;

  const embed = new EmbedBuilder()
    .setTitle(question)
    .setDescription('Type your answer in the chat!')
    .setColor('#00FF00');

  await channel.send({ embeds: [embed] });

  const filter = m => !m.author.bot;
  const collector = channel.createMessageCollector({ filter, time: 15000 });

  collector.on('collect', message => {
    const userAnswer = message.content.trim().toLowerCase();
    const isCorrect = acceptableAnswers.map(a => a.toLowerCase()).includes(userAnswer);

    if (isCorrect) {
      channel.send(`${message.author.username} answered correctly!`);
      updateScore(message.author.id);
    } else {
      channel.send(`${message.author.username} answered incorrectly.`);
    }
  });

  collector.on('end', collected => {
    console.log(`Collected ${collected.size} answers.`);
  });
}

// Update user's score
function updateScore(userId) {
  if (!scores[userId]) {
    scores[userId] = 0; // Initialize score if user does not exist
  }
  scores[userId] += 1; // Increment score
}

// Show leaderboard
async function showLeaderboard(channel) {
  const leaderboard = Object.entries(scores)
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA) // Sort by score descending
    .map(([userId, score]) => `<@${userId}>: ${score}`) // Format for display
    .join('\n');

  if (leaderboard.length === 0) {
    channel.send('No scores yet! Start a quiz to get some action going!');
  } else {
    channel.send(`**Leaderboard:**\n${leaderboard}`);
  }
}

// Event listener for bot commands
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'startquiz') {
    await startQuiz(interaction.channel);
  } else if (commandName === 'leaderboard') {
    await showLeaderboard(interaction.channel);
  }
});

// Log in to Discord
client.once('ready', () => {
  console.log('Quiz Bot is online!');
});

registerCommands();
client.login(TOKEN);
