# Hermes: The AI-Powered Code Wizard 🧙‍♂️

Welcome to Hermes, the CLI tool that will make you feel like a code wizard! With Hermes, you can `auto review` your code and `auto generate` unit tests using OpenAI's chatgpt3.5 and GPT-4 Plus Account. ✅

## Key Features
- 🤖 `AI`: AI-powered code `review`, `modify`, `translate`, and unit `test` generation - because who doesn't want a robot assistant?
- ✨ `Free`: Free to use with an `OpenAI Session Token`, enjoy chatgpt-3.5 or gpt-4 (Plus Account). We believe in making magic accessible to everyone.
- 🛡️ `Security`: Security-conscious function and class extraction, customize your `SECURITY_REGEX`. Safety first!
- 🧠 `Customizing`: Customizable prompts and model selection. Make it your own!
- 📂 `File Reader`: Supports reading files from `directories` or `git staged files`. Because we know how important organization is.

## Installation
To install Hermes, run the following command:
```
yarn add file:./tooling/hermes --dev
```

## Configuration
### OpenAI Key (Choose one)
- Set the [OpenAI API Key](https://platform.openai.com/account/api-keys) by npm config set -g
    ```
    npm config set OPENAI_API_KEY <YOUR_OPENAI_KEY> -g
    ```
- Set the `OpenAI Session Token` for free using chatgpt
    - OpenAI session token, 2 setp to get token
    - If you don't set this, will use OPENAI_API_KEY
    1. visit https://chat.openai.com/chat and login
    2. Visit https://chat.openai.com/api/auth/session to get token
    ```bash
    npm config set OPENAI_SESSION_TOKEN <YOUR_OPENAI_SESSION_TOKEN> -g
    ```
    3. Copy .env file to your project root directory, and set `OPENAI_PROXY_URL`.


### Local prompt
1. Create a `prompt` directory in the root directory of your project.
1. Add `review.txt` or `tests.txt` in the `prompt` directory.

### Pre-Commit
1. [husky](https://github.com/typicode/husky) and [lint-stage](https://github.com/okonet/lint-staged)
    ```
    "husky": {
      "hooks": {
        "pre-commit": "hermes review && hermes test && lint-staged --allow-empty"
      }
    },
    ```

### `.gitignore`:
   ```
   # review
   .hermes_review.md
   .env.local
   ```

## Usage
With Hermes, you can perform all kinds of magic tricks:

- Run the following command to `review` your git staged files like a pro:
  ```
  hermes review --model gpt-4 --max-tokens 2048
  ```
- Use the `modify` command to change your existing code with the wave of a wand:
  ```
  hermes modify -r dir -d src/pages/UserRegister/RegisterList.tsx -m gpt-4
  ```
- Generate unit `test`s with the flick of a wrist:
  ```
  hermes test --model gpt-3.5-turbo --max-tokens 2048 --file-extensions .ts,.tsx --read-type dir --read-dir-name src --test-file-type test --test-file-extension .ts --test-file-dir-name ./
  ```
- Translate your git staged files into any language with the help of Hermes:
  ```
  hermes translate -d example/i18n/test.json
  ```

### Options

- `-k, --api-key <key>`: Set the OpenAI API key.
- `-t, --openai-session-token <token>`: OpenAI session token, 2 step to get token, If you don't set this, will use OPENAI_API_KEY, will cause fee by api key.
- `-pu, --openai-proxy-url <url>`: Proxy URL to use for OpenAI API requests.
- `-m, --model <model>`: OpenAI model to use.
- `-p, --prompt <prompt>`: OpenAI prompt to use.
- `-mt, --max-tokens <tokens>`: OpenAI max tokens to use.
- `-e, --file-extensions <extensions>`: File extensions to read, example: .ts,.tsx
- `-r, --read-type <type>`: Read files from directory or git stage, example: dir or git.
- `-s, --read-git-status <name>`: Read files from git stage by status default: A,R,M.
- `-d, --read-dir-name <name>`: Root name of the directory to read files from, example: src.
- `-f, --test-file-type <type>`: Generate test file type, example: test or spec.
- `-n, --test-file-dir-name <name>`: Generate test file directory name, example: __tests__.
- `-o, --test-file-overwrite <value>`: Generate test file overwrite, default is true.
- `-w, --review-report-webhook <url>`: Webhook URL to send review report.

### Environment Variables options
See .env

## Note
1. You can set all options in `.env` or `.env.local`, which will be used as default options. Command options will override the default options.
2. The webhook currently only works with `seaTalk`. If you need to use another channel, please raise a `PR` yourself or ask for help.

Now go forth and code like a wizard! 🧙‍♂️