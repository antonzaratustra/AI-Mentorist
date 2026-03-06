import Link from "next/link";

export default function SupabaseSetupPage() {
  return (
    <main className="auth-error-page">
      <section className="auth-error-card">
        <span className="section-kicker">Supabase setup</span>
        <h1>Как подключить Supabase и Google OAuth</h1>
        <p>
          Возьми значения из <code>Project Settings -&gt; API</code>, создай <code>.env.local</code> по образцу{" "}
          <code>.env.example</code>, затем выполни SQL из <code>supabase/mentorist_schema.sql</code>.
        </p>
        <p>
          В Google Cloud Console redirect URI должен смотреть на <code>https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback</code>,
          а в Supabase URL allow list должен быть добавлен <code>http://127.0.0.1:3000/auth/callback</code>.
        </p>
        <div className="panel-actions panel-actions--wrap">
          <Link className="button button--primary" href="/">
            Вернуться на лендинг
          </Link>
          <a className="button button--ghost" href="https://supabase.com/docs/guides/auth/server-side/nextjs" rel="noreferrer" target="_blank">
            Документация Supabase
          </a>
        </div>
      </section>
    </main>
  );
}
