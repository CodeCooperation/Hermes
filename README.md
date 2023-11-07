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

### Prompts library
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

### Environment Variables options
See .env


Now go forth and code like a wizard! 🧙‍♂️

### Attribution
This project is a mix of different opensource tools.
