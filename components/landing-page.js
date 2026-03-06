import GoogleAuthButton from "./google-auth-button";

export default function LandingPage({ isSupabaseReady }) {
  return (
    <main className="landing-page">
      <div className="landing-page__glow landing-page__glow--left" />
      <div className="landing-page__glow landing-page__glow--right" />

      <section className="landing-hero">
        <div className="landing-hero__copy">
          <span className="section-kicker">Mentorist</span>
          <h1>Личная стратегия, которая собирает цели, баланс и поддержку в один живой контур.</h1>
          <p>
            Сначала пользователь входит через Google, фиксирует текущее состояние сфер и получает персональный кабинет.
            Дальше поверх этого слоя подключаются формер, цели, планнер, контакты, группы и сетевое взаимодействие.
          </p>

          <div className="landing-hero__actions">
            <GoogleAuthButton disabled={!isSupabaseReady} label="Начать через Google" next="/welcome" />
            <div className="landing-note">
              <strong>Следом после входа:</strong>
              <span>неоновое колесо баланса, быстрый onboarding и сохранение состояния в Supabase.</span>
            </div>
          </div>

          {!isSupabaseReady ? (
            <div className="landing-setup">
              <strong>Supabase пока не настроен.</strong>
              <p>
                Добавь `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` и `NEXT_PUBLIC_SITE_URL` в
                `.env.local`, затем перезапусти проект.
              </p>
            </div>
          ) : null}
        </div>

        <div className="landing-hero__visual">
          <article className="landing-preview-card">
            <p className="section-kicker">Стартовый путь</p>
            <div className="landing-preview-card__stack">
              <div className="landing-preview-step is-active">
                <strong>01</strong>
                <div>
                  <h3>Вход через Google</h3>
                  <p>Через Supabase Auth, с заделом под дополнительные провайдеры позже.</p>
                </div>
              </div>
              <div className="landing-preview-step">
                <strong>02</strong>
                <div>
                  <h3>Приветствие и баланс сфер</h3>
                  <p>Сначала экран собирает внимание на колесе, затем просит зафиксировать ощущения по 4 сферам.</p>
                </div>
              </div>
              <div className="landing-preview-step">
                <strong>03</strong>
                <div>
                  <h3>Рабочий кабинет</h3>
                  <p>Данные уходят в Supabase, а клиентский state остается быстрым за счет локального кэша.</p>
                </div>
              </div>
            </div>
          </article>

          <article className="landing-preview-card landing-preview-card--network">
            <p className="section-kicker">Архитектурный задел</p>
            <div className="landing-pill-grid">
              <span>profiles</span>
              <span>onboarding</span>
              <span>workspace_state</span>
              <span>future network</span>
            </div>
            <p>
              Уже сейчас в структуру заложены отдельный профиль пользователя, прогресс onboarding и отдельное хранилище
              состояния кабинета. Это не мешает будущим модулям и работе по сети.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
