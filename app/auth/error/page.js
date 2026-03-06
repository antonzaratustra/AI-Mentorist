import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <main className="auth-error-page">
      <section className="auth-error-card">
        <span className="section-kicker">Auth error</span>
        <h1>Не получилось завершить вход.</h1>
        <p>
          Обычно это означает, что в Supabase или Google Console еще не совпадают redirect URL. Проверь настройки и
          попробуй еще раз.
        </p>
        <Link className="button button--primary" href="/">
          Вернуться на лендинг
        </Link>
      </section>
    </main>
  );
}
