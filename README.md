
  # Employee Portal

  This is a code bundle for Employee Portal. The original project is available at https://www.figma.com/design/978je2MLWdXYo7UIVnKH4O/Employee-Portal.

  ## Running the code

  Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

Copy `.env.example` to `.env` and adjust values if you need to change the API port, database location, or SMTP settings.

## Configuration

Environment variables used by the API server (see `config.js` for defaults):

- `PORT`: порт API (за замовчуванням `4000`).
- `DB_FILENAME`: назва або абсолютний шлях до SQLite-файлу. Якщо вказано лише назву, файл буде створено в директорії `db/`.
- `APP_BASE_URL`: базовий URL фронтенду, що використовується в листах для реєстрації (за замовчуванням `http://localhost:5173`).
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`, `SMTP_FROM`: налаштування SMTP для відправки листів з підтвердженням реєстрації. Якщо SMTP не вказаний, сервер використовує JSON-транспорт Nodemailer і в відповіді API повертає тестове посилання.
- `REG_TOKEN_HOURS`: скільки годин дійсний токен завершення реєстрації (за замовчуванням `24`).
  