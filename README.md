
# Discord Quiz Bot

An interactive quiz bot for Discord that allows users to participate in quizzes with different question types including multiple-choice, true/false, and short-answer. The bot tracks user scores and displays a leaderboard.

## Features

- **Multiple Choice Questions:** Users can react to answer questions using emoji reactions.
- **True/False Questions:** Users respond with thumbs up for True and thumbs down for False.
- **Short Answer Questions:** Users can type their answers directly in the chat.
- **Score Tracking:** The bot maintains scores for each user.
- **Leaderboard:** Displays a leaderboard showing user scores.
- **Dynamic Question Loading:** Questions are loaded from a JSON file, allowing for easy updates.

## Technologies Used

- [Node.js](https://nodejs.org/) - JavaScript runtime environment.
- [Discord.js](https://discord.js.org/) - A powerful library for interacting with the Discord API.
- [dotenv](https://www.npmjs.com/package/dotenv) - For managing environment variables.
- JSON - For storing questions.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/EvilSeal1980/Discord_Quiz_Bot.git
   cd Discord_Quiz_Bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Discord bot credentials:
   ```plaintext
   CLIENT_TOKEN=your_token_here
   CLIENT_ID=your_client_id_here
   GUILD_ID=your_guild_id_here
   ```

4. Prepare your questions in a `questions.json` file in the root directory. Example format:
   ```json
   [
     {
       "type": "multipleChoice",
       "question": "What is the capital of France?",
       "choices": ["Berlin", "Madrid", "Paris", "Rome"],
       "correctAnswer": 3
     },
     {
       "type": "trueFalse",
       "question": "The sky is blue.",
       "correctAnswer": true
     },
     {
       "type": "shortAnswer",
       "question": "What is 2 + 2?",
       "acceptableAnswers": ["4", "four"]
     }
   ]
   ```

5. Run the bot:
   ```bash
   npm start
   ```

## Usage

- Use the `/startquiz` command to initiate a quiz.
- Use the `/leaderboard` command to view the current leaderboard.

## Contributing

Contributions are welcome! If you have suggestions or improvements, feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
```
