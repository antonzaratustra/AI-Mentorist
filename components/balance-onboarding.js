"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createInitialState } from "./mentorist-data";
import { createSupabaseBrowserClient } from "../lib/supabase/client";

const SPHERE_META = {
  growth: { label: "Развитие", color: "#52d6ff", short: "Рост" },
  health: { label: "Здоровье", color: "#9ce24d", short: "Тело" },
  work: { label: "Дело", color: "#ffc247", short: "Дело" },
  relationships: { label: "Отношения", color: "#ff7f5c", short: "Связи" },
};

const SECTORS = [
  { id: "growth", start: 270, end: 360 },
  { id: "health", start: 0, end: 90 },
  { id: "work", start: 90, end: 180 },
  { id: "relationships", start: 180, end: 270 },
];

const DEFAULT_SPHERES = {
  health: 63,
  relationships: 56,
  growth: 69,
  work: 61,
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function polarToCartesian(cx, cy, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

function describeSector(cx, cy, innerRadius, outerRadius, startAngle, endAngle) {
  const startOuter = polarToCartesian(cx, cy, outerRadius, endAngle);
  const endOuter = polarToCartesian(cx, cy, outerRadius, startAngle);
  const startInner = polarToCartesian(cx, cy, innerRadius, endAngle);
  const endInner = polarToCartesian(cx, cy, innerRadius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${endOuter.x} ${endOuter.y}`,
    `L ${endInner.x} ${endInner.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${startInner.x} ${startInner.y}`,
    "Z",
  ].join(" ");
}

function getAverageBalance(spheres) {
  return Math.round((spheres.health + spheres.relationships + spheres.growth + spheres.work) / 4);
}

function createInitials(value) {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "MN";
}

function createSeedWorkspaceState(user, form, spheres) {
  const base = createInitialState();

  return {
    ...base,
    profile: {
      ...base.profile,
      name: form.displayName.trim(),
      role: "Участник Mentorist",
      avatar: createInitials(form.displayName),
      horizon: form.primaryFocus.trim(),
      credo:
        form.supportMode === "mentor"
          ? "Двигаться не в одиночку, а через ясный ритм, обратную связь и проверку реальности."
          : "Искать не идеальный план, а рабочий темп, который можно удерживать без внутреннего распада.",
    },
    spheres: {
      ...spheres,
    },
  };
}

function GlowBalanceWheel({ canAdjust, selectedSphereId, onChangeSphere, onSelectSphere, spheres }) {
  const wheelRef = useRef(null);
  const dragRef = useRef(false);
  const innerRadius = 68;
  const minOuterRadius = 106;
  const maxOuterRadius = 156;
  const selectedSphere = SPHERE_META[selectedSphereId];

  function getPointerData(clientX, clientY) {
    if (!wheelRef.current) {
      return null;
    }

    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.hypot(clientX - centerX, clientY - centerY);
    const angle = (Math.atan2(clientY - centerY, clientX - centerX) * 180) / Math.PI;
    const normalizedAngle = (angle + 450) % 360;

    let sphereId = "growth";
    if (normalizedAngle >= 0 && normalizedAngle < 90) {
      sphereId = "health";
    } else if (normalizedAngle >= 90 && normalizedAngle < 180) {
      sphereId = "work";
    } else if (normalizedAngle >= 180 && normalizedAngle < 270) {
      sphereId = "relationships";
    }

    const nextValue = clamp(
      Math.round(((distance - innerRadius) / (maxOuterRadius - innerRadius)) * 100),
      12,
      100,
    );

    return { sphereId, nextValue, distance };
  }

  function updateFromPointer(clientX, clientY) {
    if (!canAdjust) {
      return;
    }

    const result = getPointerData(clientX, clientY);
    if (!result || result.distance < innerRadius - 10 || result.distance > maxOuterRadius + 18) {
      return;
    }

    onSelectSphere(result.sphereId);
    onChangeSphere(result.sphereId, result.nextValue);
  }

  function handlePointerDown(event) {
    if (!canAdjust) {
      return;
    }

    dragRef.current = true;
    updateFromPointer(event.clientX, event.clientY);
  }

  function handlePointerMove(event) {
    if (!dragRef.current) {
      return;
    }

    updateFromPointer(event.clientX, event.clientY);
  }

  function stopPointer() {
    dragRef.current = false;
  }

  return (
    <div className={`balance-wheel balance-wheel--onboarding ${canAdjust ? "is-live" : "is-warming"}`}>
      <div className="balance-wheel__shell balance-wheel__shell--neon">
        <svg
          className="balance-wheel__svg"
          onPointerCancel={stopPointer}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopPointer}
          ref={wheelRef}
          viewBox="0 0 320 320"
        >
          {[92, 110, 128, 146].map((radius) => (
            <circle key={radius} className="balance-wheel__grid" cx="160" cy="160" r={radius} />
          ))}
          {SECTORS.map((sector) => (
            <path
              key={`${sector.id}-base`}
              className="balance-wheel__base"
              d={describeSector(160, 160, innerRadius, maxOuterRadius, sector.start, sector.end)}
            />
          ))}
          {SECTORS.map((sector) => {
            const value = spheres[sector.id];
            const outerRadius = minOuterRadius + ((maxOuterRadius - minOuterRadius) * value) / 100;
            return (
              <path
                key={sector.id}
                className={`balance-wheel__segment ${selectedSphereId === sector.id ? "is-active" : ""}`}
                d={describeSector(160, 160, innerRadius, outerRadius, sector.start, sector.end)}
                fill={SPHERE_META[sector.id].color}
                onClick={() => onSelectSphere(sector.id)}
              />
            );
          })}
          <circle className="balance-wheel__core" cx="160" cy="160" r={innerRadius - 4} />
          <text className="balance-wheel__eyebrow" x="160" y="122">
            БАЛАНС
          </text>
          <text className="balance-wheel__value" x="160" y="170">
            {getAverageBalance(spheres)}
          </text>
          <text className="balance-wheel__caption" x="160" y="205">
            ТЕКУЩЕЕ ОЩУЩЕНИЕ ПО 4 СФЕРАМ
          </text>
        </svg>
      </div>

      <div className="balance-wheel__legend">
        {Object.entries(SPHERE_META).map(([id, sphere]) => (
          <button
            key={id}
            className={`balance-wheel__chip ${selectedSphereId === id ? "is-active" : ""}`}
            onClick={() => onSelectSphere(id)}
            style={{ "--chip-accent": sphere.color }}
            type="button"
          >
            <span>{sphere.label}</span>
            <strong>{spheres[id]}</strong>
          </button>
        ))}
      </div>

      <div className="balance-wheel__detail balance-wheel__detail--intro">
        <div>
          <span className="section-kicker">{canAdjust ? "Твоя оценка" : "Калибровка"}</span>
          <h3>{selectedSphere.label}</h3>
          <p>
            {canAdjust
              ? "Перетащи сегмент прямо на колесе или скорректируй значение ползунком."
              : "Колесо несколько секунд считывает ритм и визуально собирается в стартовую форму."}
          </p>
        </div>
        <div className="balance-wheel__range">
          <button className="icon-button" disabled={!canAdjust} onClick={() => onChangeSphere(selectedSphereId, spheres[selectedSphereId] - 4)} type="button">
            −
          </button>
          <input
            aria-label={`Состояние сферы ${selectedSphere.label}`}
            disabled={!canAdjust}
            max="100"
            min="0"
            onChange={(event) => onChangeSphere(selectedSphereId, Number(event.target.value))}
            type="range"
            value={spheres[selectedSphereId]}
          />
          <button className="icon-button" disabled={!canAdjust} onClick={() => onChangeSphere(selectedSphereId, spheres[selectedSphereId] + 4)} type="button">
            +
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BalanceOnboarding({ initialDisplayName, schemaReady, user }) {
  const router = useRouter();
  const [spheres, setSpheres] = useState(DEFAULT_SPHERES);
  const [selectedSphereId, setSelectedSphereId] = useState("growth");
  const [canAdjust, setCanAdjust] = useState(false);
  const [form, setForm] = useState({
    displayName: initialDisplayName,
    primaryFocus: "",
    supportMode: "mentor",
  });
  const [errorText, setErrorText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const warmupTimerRef = useRef(null);
  const finishTimerRef = useRef(null);

  useEffect(() => {
    warmupTimerRef.current = window.setInterval(() => {
      setSpheres({
        health: 38 + Math.round(Math.random() * 48),
        relationships: 34 + Math.round(Math.random() * 50),
        growth: 42 + Math.round(Math.random() * 44),
        work: 36 + Math.round(Math.random() * 52),
      });
    }, 120);

    finishTimerRef.current = window.setTimeout(() => {
      window.clearInterval(warmupTimerRef.current);
      setSpheres(DEFAULT_SPHERES);
      window.setTimeout(() => setCanAdjust(true), 260);
    }, 2200);

    return () => {
      window.clearInterval(warmupTimerRef.current);
      window.clearTimeout(finishTimerRef.current);
    };
  }, []);

  function changeSphereValue(sphereId, nextValue) {
    setSpheres((current) => ({
      ...current,
      [sphereId]: clamp(nextValue, 0, 100),
    }));
  }

  function changeFormField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.displayName.trim() || !form.primaryFocus.trim()) {
      setErrorText("Заполни имя и текущий главный фокус, чтобы закрепить стартовый контур.");
      return;
    }

    if (!schemaReady) {
      setErrorText("Сначала примени SQL-схему Supabase, иначе сохранить onboarding будет некуда.");
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setErrorText("Supabase не настроен в .env.local.");
      return;
    }

    setErrorText("");
    setIsSaving(true);

    const seedState = createSeedWorkspaceState(user, form, spheres);
    const completedAt = new Date().toISOString();
    const storageKey = `mentorist-demo-state:${user.id}`;

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email ?? null,
        full_name: form.displayName.trim(),
        avatar_url: user.userMetadata?.avatar_url ?? null,
      },
      { onConflict: "id" },
    );

    if (profileError) {
      setErrorText(profileError.message);
      setIsSaving(false);
      return;
    }

    const { error: onboardingError } = await supabase.from("user_onboarding").upsert(
      {
        user_id: user.id,
        display_name: form.displayName.trim(),
        primary_focus: form.primaryFocus.trim(),
        support_mode: form.supportMode,
        balance_health: spheres.health,
        balance_relationships: spheres.relationships,
        balance_growth: spheres.growth,
        balance_work: spheres.work,
        answers: {
          primaryFocus: form.primaryFocus.trim(),
          supportMode: form.supportMode,
        },
        onboarding_completed_at: completedAt,
      },
      { onConflict: "user_id" },
    );

    if (onboardingError) {
      setErrorText(onboardingError.message);
      setIsSaving(false);
      return;
    }

    const { error: workspaceError } = await supabase.from("user_workspace_state").upsert(
      {
        user_id: user.id,
        app_state: seedState,
        source: "welcome",
        synced_at: completedAt,
      },
      { onConflict: "user_id" },
    );

    if (workspaceError) {
      setErrorText(workspaceError.message);
      setIsSaving(false);
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(seedState));
    router.push("/workspace");
    router.refresh();
  }

  return (
    <main className="welcome-page">
      <div className="landing-page__glow landing-page__glow--left" />
      <div className="landing-page__glow landing-page__glow--right" />

      <section className={`welcome-card ${canAdjust ? "is-live" : ""}`}>
        <div className="welcome-card__intro">
          <span className="section-kicker">Добро пожаловать</span>
          <h1>Сначала почувствуем, как сейчас устроен твой внутренний баланс.</h1>
          <p>
            Колесо на секунду оживает и собирается в стартовый образ. Потом ты можешь руками скорректировать каждую
            сферу и закрепить первый снимок состояния.
          </p>
        </div>

        <div className="welcome-card__wheel">
          <GlowBalanceWheel
            canAdjust={canAdjust}
            onChangeSphere={changeSphereValue}
            onSelectSphere={setSelectedSphereId}
            selectedSphereId={selectedSphereId}
            spheres={spheres}
          />
        </div>

        <form className="welcome-form" onSubmit={handleSubmit}>
          <div className="panel-head">
            <div>
              <p className="section-kicker">Базовое заполнение</p>
              <h3>Соберем стартовый профиль</h3>
            </div>
            <span className="status-pill status-pill--accent">Шаг 1</span>
          </div>

          <label className="field-group">
            <span>Как к тебе обращаться</span>
            <input
              className="field"
              onChange={(event) => changeFormField("displayName", event.target.value)}
              placeholder="Например, Марина"
              type="text"
              value={form.displayName}
            />
          </label>

          <label className="field-group">
            <span>На чем сейчас главный фокус</span>
            <textarea
              className="field field--textarea"
              onChange={(event) => changeFormField("primaryFocus", event.target.value)}
              placeholder="Что ты хочешь стабилизировать или сдвинуть в ближайшее время"
              rows="4"
              value={form.primaryFocus}
            />
          </label>

          <div className="field-group">
            <span>Какой тип поддержки нужен в первую очередь</span>
            <div className="choice-row">
              {[
                { id: "mentor", title: "Наставник", detail: "Нужна структура, внешняя проверка и трезвый взгляд." },
                { id: "pair", title: "Партнер по ритму", detail: "Нужен человек, с кем двигаться параллельно и не выпадать." },
              ].map((option) => (
                <button
                  key={option.id}
                  className={`choice-card ${form.supportMode === option.id ? "is-active" : ""}`}
                  onClick={() => changeFormField("supportMode", option.id)}
                  type="button"
                >
                  <strong>{option.title}</strong>
                  <span>{option.detail}</span>
                </button>
              ))}
            </div>
          </div>

          {!schemaReady ? (
            <div className="landing-setup">
              <strong>Схема базы еще не применена.</strong>
              <p>Сначала выполни SQL из `supabase/mentorist_schema.sql`, иначе onboarding не сохранится.</p>
            </div>
          ) : null}

          {errorText ? <p className="form-error">{errorText}</p> : null}

          <div className="panel-actions panel-actions--wrap">
            <button className="button button--primary" disabled={!canAdjust || isSaving} type="submit">
              {isSaving ? "Сохраняем старт…" : "Открыть кабинет"}
            </button>
            <span className="welcome-form__hint">Данные сохраняются локально сразу и синхронно уходят в Supabase.</span>
          </div>
        </form>
      </section>
    </main>
  );
}
