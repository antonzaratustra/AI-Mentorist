import Link from "next/link";

export default function SupabaseSetupCard({ title = "Нужно применить SQL-схему Supabase." }) {
  return (
    <main className="auth-error-page">
      <section className="auth-error-card">
        <span className="section-kicker">Supabase setup</span>
        <h1>{title}</h1>
        <p>
          Похоже, auth уже работает, но таблицы проекта еще не созданы. Примени SQL из
          `supabase/mentorist_schema.sql`, затем обнови страницу.
        </p>
        <div className="panel-actions panel-actions--wrap">
          <Link className="button button--primary" href="/">
            На лендинг
          </Link>
          <Link className="button button--ghost" href="/docs/supabase-setup">
            Где это настраивать
          </Link>
        </div>
      </section>
    </main>
  );
}
