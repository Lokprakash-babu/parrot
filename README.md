# Parrot - Message Rephrasing Slack Bot with AWS Bedrock

This is a Slack bot that rephrases messages using AWS Bedrock's AI models to improve tone, clarity, or simplicity.

## Features

- Slash commands for different rephrasing styles:

  - `/polite` - Makes messages more polite and professional
  - `/clarity` - Improves clarity and readability
  - `/simple` - Simplifies complex messages

- Powered by AWS Bedrock AI models:
  - Claude (Anthropic)
  - Titan (Amazon)
  - Llama 2 (Meta)

## Setup

### Prerequisites

1. AWS Account with access to AWS Bedrock
2. Node.js and npm/yarn installed
3. Slack workspace with permission to add apps

### AWS Bedrock Setup

1. Enable AWS Bedrock in your AWS account
2. Request access to the models you want to use (Claude, Titan, Llama 2)
3. Set up AWS credentials on your machine or deployment environment

### Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

### Configuration

Set the following environment variables:

- `AWS_REGION`: AWS region where Bedrock is available (default: "us-east-1")
- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key

You can also modify the model selection in `index.js` by changing:

```javascript
const MODEL = MODELS.CLAUDE; // Change to MODELS.TITAN or MODELS.LLAMA
```

### Running the Application

Start the server:

```
node index.js
```

The server will start on port 3000 by default.

### Testing AWS Bedrock Integration

Run the test script to verify AWS Bedrock integration:

```
node test-bedrock.js
```

## Slack App Configuration

1. Create a new Slack app at https://api.slack.com/apps
2. Under "Slash Commands", create three commands:
   - `/polite` - Points to `https://your-server-url/polite`
   - `/clarity` - Points to `https://your-server-url/clarity`
   - `/simple` - Points to `https://your-server-url/simple`
3. Install the app to your workspace

## Usage

In Slack, use any of the slash commands followed by the text you want to rephrase:

```
/polite Can you fix this ASAP?
```

The bot will respond with a rephrased version:

```
*polite version:*
Would it be possible for you to address this when you have a moment? Thank you.
```

## API Endpoints

The API supports both form-urlencoded and JSON request formats:

### Form-urlencoded (for Slack integration)

```bash
curl -X POST http://localhost:3000/polite \
  -H "Content-Type: application/json" \
  -d "text=Fix this now!"
```

### JSON (for Postman or other API clients)

```bash
curl -X POST http://localhost:3000/polite \
  -H "Content-Type: application/json" \
  -d '{"text":"Fix this now!"}'
```

## Testing the API with curl

You can test the API endpoints directly using curl commands. We've provided two options:

### Option 1: Using the test script

Run the provided test script:

```bash
# Make the script executable
chmod +x test-api.sh

# Run the script (defaults to localhost:3000)
./test-api.sh

# Or specify a different base URL
./test-api.sh https://your-server-url
```

### Option 2: Manual curl commands

#### Health Check

```bash
curl -X GET http://localhost:3000/health
```

#### Polite Endpoint

```bash
curl -X POST http://localhost:3000/polite \
  -H "Content-Type: application/json" \
  -d "command=/polite&text=Fix this now!"
```

#### Clarity Endpoint

```bash
curl -X POST http://localhost:3000/clarity \
  -H "Content-Type: application/json" \
  -d "command=/clarity&text=The thing we talked about needs attention."
```

#### Simple Endpoint

```bash
curl -X POST http://localhost:3000/simple \
  -H "Content-Type: application/json" \
  -d "command=/simple&text=The implementation of the functionality requires additional consideration."
```

For more detailed examples and error cases, see the [curl-examples.md](curl-examples.md) file.

## License

MIT
