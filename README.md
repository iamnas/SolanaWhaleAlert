# Solana Whale Alert Bot

A Telegram bot built with NestJS and Telegraf for tracking and alerting about major token movements, whale activities, and other Solana blockchain updates.

## Features

- **/start** - Welcome message and list of available commands
- **/top10** - Get the top 10 tokens by market cap and trading volume
- **/newlistings** - Get newly listed tokens on Solana
- **/whalealerts** - Receive alerts for major token movements and whale activity
- **/createwallet** - Create a new wallet address on Solana
- **/tokeninfo [address]** - Get detailed information about a specific token by its address
- **/help** - Get a list of all available commands

## Prerequisites

Before running the bot, make sure you have the following:

- Node.js installed
- A Telegram bot token from [BotFather](https://core.telegram.org/bots#botfather)
- A BirdEye API key for fetching Solana token data

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/iamnas/SolanaWhaleAlert.git
   cd SolanaWhaleAlert
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Set up your environment variables by creating a `.env` file in the root directory:

   ```bash
   touch .env
   ```

4. Add the following configuration to your `.env` file:

   ```plaintext
   # Telegram Bot Configuration
   CHATID=your-telegram-chat-id
   TELEGRAM_TOKEN=your-telegram-bot-token

   # Solana and USDC Configuration
   USDC_ADDRESS=your-usdc-token-address
   THRESHOLD_AMOUNT=1000 # Set your desired threshold amount

   # BirdEye API Configuration
   BIRDEYE_API_KEY=your-birdeye-api-key
   BIRDEYE_URL=https://api.birdeye.so
   BIRDEYE_TOP_TOKEN_URL=https://api.birdeye.so/top-tokens
   BIRDEYE_NEW_LIST_URL=https://api.birdeye.so/new-listings

   # Webhook Configuration
   setWebhook=your-webhook-url
   ```

   Replace the placeholders with your actual values.

5. Run the bot:

   ```bash
   npm run start
   ```

## Usage

Once the bot is running, you can use the following commands in your Telegram chat:

- **/start**: Displays a welcome message and a list of available commands.
- **/top10**: Fetches the top 10 tokens by market cap and trading volume.
- **/newlistings**: Retrieves newly listed tokens on Solana.
- **/whalealerts**: Provides alerts for major token movements and whale activity.
- **/createwallet**: Generates a new wallet address on Solana.
- **/tokeninfo [address]**: Fetches detailed information about a specific token using its address.
- **/help**: Lists all available commands with a brief description.

## Contributing

Feel free to submit issues or pull requests if you find bugs or have suggestions for improvements.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.