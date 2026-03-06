"use client";

import { startTransition, useDeferredValue, useEffect, useState } from "react";
import {
  CONTACT_REPLY_LIBRARY,
  ENERGY_META,
  FORMER_SECTION_DEFS,
  MODULES,
  POST_TYPES,
  SPHERE_META,
  SPHERE_ORDER,
  WEEK_DAYS,
  createEmptyGoalDraft,
  createInitialState,
} from "./mentorist-data";

const STORAGE_KEY = "mentorist-demo-state-v2";
const USER_ID = "user";

const STOP_WORDS = new Set([
  "и",
  "в",
  "во",
  "не",
  "что",
  "он",
  "на",
  "я",
  "с",
  "со",
  "как",
  "а",
  "то",
  "все",
  "она",
  "так",
  "его",
  "но",
  "да",
  "ты",
  "к",
  "у",
  "же",
  "вы",
  "за",
  "бы",
  "по",
  "только",
  "ее",
  "мне",
  "есть",
  "если",
  "когда",
  "чтобы",
  "для",
  "это",
  "или",
  "из",
  "без",
  "под",
  "над",
  "от",
  "же",
  "еще",
  "уже",
  "такой",
  "также",
  "где",
  "при",
  "про",
  "через",
  "который",
  "которая",
  "которые",
  "этот",
  "эта",
  "эти",
  "чем",
  "года",
  "день",
  "дня",
  "недели",
  "неделя",
]);

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
}

function formatTime(date = new Date()) {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

function parseLines(value) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function tokenize(value) {
  return value
    .toLowerCase()
    .replace(/[^a-zа-я0-9\s-]/gi, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !STOP_WORDS.has(word));
}

function buildSemanticWords(state) {
  const pool = [
    state.profile.mission,
    state.profile.horizon,
    ...Object.values(state.former.sections),
    ...state.goals.flatMap((goal) => [goal.title, goal.why, goal.metric, goal.tags.join(" ")]),
  ].join(" ");

  const counts = new Map();
  tokenize(pool).forEach((word) => {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  });

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 14)
    .map(([word], index) => ({
      word,
      variant: (index % 4) + 1,
      left: 8 + ((index * 11) % 74),
      top: 12 + ((index * 16) % 68),
    }));
}

function getFormerSectionFill(content) {
  const lines = parseLines(content);
  const density = Math.min(74, content.trim().length / 5);
  return clamp(Math.round(18 + lines.length * 6 + density), 18, 100);
}

function getAverageBalance(spheres) {
  const values = SPHERE_ORDER.map((key) => spheres[key]);
  return Math.round(values.reduce((sum, current) => sum + current, 0) / values.length);
}

function goalProgress(goal) {
  const doneCount = goal.stages.filter((stage) => stage.done).length;
  return Math.round((doneCount / Math.max(goal.stages.length, 1)) * 100);
}

function countUnreadMessages(contacts) {
  return contacts.reduce(
    (total, contact) => total + contact.messages.filter((message) => message.author !== USER_ID && !message.read).length,
    0,
  );
}

function getSphereCards(state) {
  return SPHERE_ORDER.map((id) => ({
    id,
    ...SPHERE_META[id],
    score: state.spheres[id],
  }));
}

function buildFormerNavigation(state) {
  return FORMER_SECTION_DEFS.map((section) => ({
    ...section,
    fill: getFormerSectionFill(state.former.sections[section.id]),
  }));
}

function buildPlannerDays(goals, planner) {
  return WEEK_DAYS.map((day) => {
    const stageTasks = goals.flatMap((goal) =>
      goal.stages
        .filter((stage) => stage.weekday === day.id)
        .map((stage) => ({
          id: stage.id,
          title: stage.title,
          goalId: goal.id,
          goalTitle: goal.title,
          sphere: goal.sphere,
          done: stage.done,
          type: "goal",
        })),
    );

    const quickTasks = (planner.notesByDay[day.id] ?? []).map((task) => ({
      ...task,
      type: "quick",
    }));

    return {
      ...day,
      tasks: [...stageTasks, ...quickTasks],
    };
  });
}

function getFirstReminder(plannerDays) {
  for (const day of plannerDays) {
    const nextTask = day.tasks.find((task) => task.type === "goal" && !task.done) ?? day.tasks.find((task) => !task.done);
    if (nextTask) {
      return {
        ...nextTask,
        dayLabel: day.label,
      };
    }
  }

  return null;
}

function applyEnergyDelta(energies, delta) {
  return {
    intellect: clamp(energies.intellect + (delta.intellect ?? 0), 0, 100),
    activity: clamp(energies.activity + (delta.activity ?? 0), 0, 100),
    informative: clamp(energies.informative + (delta.informative ?? 0), 0, 100),
    mento: clamp(energies.mento + (delta.mento ?? 0), 0, 100),
  };
}

function prependEvent(state, event) {
  return {
    ...state,
    events: [event, ...state.events].slice(0, 18),
  };
}

function createEvent(title, detail, accent = "#52d6ff") {
  return {
    id: createId("event"),
    title,
    detail,
    time: formatTime(),
    accent,
  };
}

function createDraftFromGoal(goal) {
  return {
    id: goal.id,
    title: goal.title,
    sphere: goal.sphere,
    why: goal.why,
    metric: goal.metric,
    status: goal.status,
    dueDate: goal.dueDate,
    groupId: goal.groupId,
    mentorId: goal.mentorId,
    menteeId: goal.menteeId,
    tagText: goal.tags.join(", "),
    notes: goal.notes,
    mentoCost: goal.resourceCost.mento,
    intellectCost: goal.resourceCost.intellect,
    activityCost: goal.resourceCost.activity,
    informativeCost: goal.resourceCost.informative,
    stages: goal.stages.map((stage) => ({
      id: stage.id,
      title: stage.title,
      weekday: stage.weekday,
    })),
  };
}

function draftToGoal(draft, previousGoal) {
  const normalizedStages = draft.stages
    .map((stage, index) => ({
      id: stage.id || createId(`stage-${index + 1}`),
      title: stage.title.trim(),
      weekday: stage.weekday,
    }))
    .filter((stage) => stage.title);

  const previousStagesById = Object.fromEntries((previousGoal?.stages ?? []).map((stage) => [stage.id, stage]));

  return {
    id: draft.id ?? createId("goal"),
    title: draft.title.trim(),
    sphere: draft.sphere,
    status: draft.status,
    why: draft.why.trim(),
    metric: draft.metric.trim(),
    startDate: previousGoal?.startDate ?? "2026-03-06",
    dueDate: draft.dueDate,
    groupId: draft.groupId,
    mentorId: draft.mentorId,
    menteeId: draft.menteeId,
    tags: draft.tagText
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    notes: draft.notes.trim(),
    resourceCost: {
      mento: Number(draft.mentoCost) || 0,
      intellect: Number(draft.intellectCost) || 0,
      activity: Number(draft.activityCost) || 0,
      informative: Number(draft.informativeCost) || 0,
    },
    stages: normalizedStages.map((stage) => ({
      ...stage,
      done: previousStagesById[stage.id]?.done ?? false,
    })),
  };
}

function findContactById(state, id) {
  return state.contacts.find((contact) => contact.id === id);
}

function findGroupById(state, id) {
  return state.groups.find((group) => group.id === id);
}

function getGoalStatusLabel(status) {
  switch (status) {
    case "completed":
      return "Завершена";
    case "planned":
      return "Запланирована";
    case "paused":
      return "Пауза";
    case "active":
    default:
      return "В работе";
  }
}

function getGoalStatusTone(status) {
  switch (status) {
    case "completed":
      return "success";
    case "paused":
      return "warning";
    case "planned":
      return "info";
    case "active":
    default:
      return "accent";
  }
}

function HeroRing({ average }) {
  return (
    <div className="balance-ring">
      <div className="balance-ring__inner">
        <span className="balance-ring__eyebrow">Баланс</span>
        <strong>{average}</strong>
        <span className="balance-ring__caption">средний индекс по 4 сферам</span>
      </div>
    </div>
  );
}

function AppNav({ activeModule, onNavigate }) {
  return (
    <nav className="module-stack" aria-label="Модули приложения">
      {MODULES.map((module) => (
        <button
          key={module.id}
          className={`module-button ${activeModule === module.id ? "is-active" : ""}`}
          onClick={() => onNavigate(module.id)}
          type="button"
        >
          <span>{module.label}</span>
          <small>{module.eyebrow}</small>
        </button>
      ))}
    </nav>
  );
}

function ProfileView({ state, semanticWords, activeGoals, recentEvents, onCreateGoal, onAbilityAction, onOpenGoal }) {
  return (
    <div className="view-grid profile-view">
      <section className="panel profile-cloud-panel">
        <div className="word-cloud">
          {semanticWords.map((item) => (
            <span
              key={item.word}
              className={`word-cloud__item word-cloud__item--${item.variant}`}
              style={{ left: `${item.left}%`, top: `${item.top}%` }}
            >
              {item.word}
            </span>
          ))}
        </div>
        <div className="profile-focus">
          <div className="avatar-core">{state.profile.avatar}</div>
          <div className="profile-focus__copy">
            <p className="section-kicker">Личный вектор</p>
            <h3>{state.profile.name}</h3>
            <p>{state.profile.role}</p>
            <p>{state.profile.mission}</p>
          </div>
        </div>
      </section>

      <section className="panel profile-summary-panel">
        <p className="section-kicker">Активные цели</p>
        <div className="goal-list">
          {activeGoals.slice(0, 3).map((goal) => (
            <button key={goal.id} className="goal-card" onClick={() => onOpenGoal(goal.id)} type="button">
              <div className="goal-card__head">
                <strong>{goal.title}</strong>
                <span>{goalProgress(goal)}%</span>
              </div>
              <p>{goal.metric}</p>
              <div className="meter">
                <span style={{ width: `${goalProgress(goal)}%`, background: SPHERE_META[goal.sphere].color }} />
              </div>
            </button>
          ))}
        </div>
        <div className="panel-actions">
          <button className="button button--primary" onClick={onCreateGoal} type="button">
            Добавить цель
          </button>
        </div>
      </section>

      <section className="panel profile-actions-panel">
        <p className="section-kicker">Быстрые действия</p>
        <div className="action-grid">
          <button className="action-card action-card--lime" onClick={() => onAbilityAction("focus")} type="button">
            <strong>Фокус недели</strong>
            <span>Открыть цель, которая требует следующего шага уже сегодня.</span>
          </button>
          <button className="action-card action-card--cyan" onClick={() => onAbilityAction("lingua")} type="button">
            <strong>Лингвобомба</strong>
            <span>Перейти в контакты и отправить быстрый запрос на честный фидбек.</span>
          </button>
          <button className="action-card action-card--amber" onClick={() => onAbilityAction("boost")} type="button">
            <strong>Разгон энергии</strong>
            <span>Начислить небольшую поддержку и зафиксировать импульс в событиях.</span>
          </button>
          <button className="action-card action-card--coral" onClick={() => onAbilityAction("perspective")} type="button">
            <strong>Смена оптики</strong>
            <span>Открыть SWOT и перепроверить цель через ограничения и возможности.</span>
          </button>
        </div>
      </section>

      <section className="panel profile-events-panel">
        <p className="section-kicker">Что изменилось сегодня</p>
        <div className="timeline-list">
          {recentEvents.map((event) => (
            <article key={event.id} className="timeline-card" style={{ "--accent": event.accent }}>
              <span>{event.time}</span>
              <h3>{event.title}</h3>
              <p>{event.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function FormerView({
  formerNavigation,
  selectedFormerSectionId,
  formerDraft,
  onSelectSection,
  onChangeDraft,
  onSaveSection,
  onSendToConstructor,
  recentEvents,
  formerSections,
}) {
  const activeSection = formerNavigation.find((section) => section.id === selectedFormerSectionId);
  const values = parseLines(formerSections.values).slice(0, 5);
  const roles = parseLines(formerSections.roles).slice(0, 5);

  return (
    <div className="view-grid former-view">
      <section className="panel former-menu-panel">
        <p className="section-kicker">Разделы формера</p>
        <div className="former-menu">
          {formerNavigation.map((section) => (
            <button
              key={section.id}
              className={`former-tab ${selectedFormerSectionId === section.id ? "is-active" : ""}`}
              onClick={() => onSelectSection(section.id)}
              type="button"
            >
              <div className="former-tab__head">
                <span>{section.label}</span>
                <strong>{section.fill}%</strong>
              </div>
              <div className="meter">
                <span style={{ width: `${section.fill}%` }} />
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="panel former-editor-panel">
        <p className="section-kicker">{activeSection?.label}</p>
        <h3>{activeSection?.hint}</h3>
        <textarea
          className="field field--textarea editor-textarea"
          onChange={(event) => onChangeDraft(event.target.value)}
          value={formerDraft}
        />
        <div className="panel-actions">
          <button className="button button--primary" onClick={onSaveSection} type="button">
            Сохранить раздел
          </button>
          <button className="button button--ghost" onClick={onSendToConstructor} type="button">
            Использовать в новой цели
          </button>
        </div>
      </section>

      <section className="panel former-side-panel">
        <p className="section-kicker">Опорные элементы</p>
        <div className="tag-list">
          {values.map((value) => (
            <span key={value} className="tag-pill">
              {value}
            </span>
          ))}
        </div>
        <div className="tag-list">
          {roles.map((role) => (
            <span key={role} className="tag-pill tag-pill--soft">
              {role}
            </span>
          ))}
        </div>
        <div className="timeline-list">
          {recentEvents.map((event) => (
            <article key={event.id} className="timeline-card" style={{ "--accent": event.accent }}>
              <span>{event.time}</span>
              <h3>{event.title}</h3>
              <p>{event.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function GoalsView({
  plannerDays,
  plannerRadius,
  activeGoals,
  allGoals,
  selectedGoal,
  onSelectGoal,
  onCompleteStage,
  onToggleQuickTask,
  onAddQuickTask,
  quickTaskDrafts,
  onChangeQuickTaskDraft,
  onChangeRadius,
  onEditGoal,
  onCreateGoal,
  onOpenGroup,
}) {
  const orbitGoals = activeGoals.slice(0, 4);
  const orbitPositions = [
    { left: 51, top: 15 },
    { left: 78, top: 42 },
    { left: 60, top: 75 },
    { left: 26, top: 50 },
  ];

  return (
    <div className="view-grid goals-view">
      <section className="panel planner-panel">
        <p className="section-kicker">Планнер недели</p>
        <div className="planner-list">
          {plannerDays.map((day) => (
            <div key={day.id} className="planner-day">
              <div className="planner-day__meta">
                <strong>{day.short}</strong>
                <span>{day.dateLabel}</span>
              </div>
              <div className="planner-day__tasks">
                {day.tasks.map((task) =>
                  task.type === "goal" ? (
                    <button
                      key={task.id}
                      className={`planner-task planner-task--goal ${task.done ? "is-done" : ""}`}
                      onClick={() => onCompleteStage(task.goalId, task.id)}
                      type="button"
                    >
                      <strong>{task.title}</strong>
                      <span>{task.goalTitle}</span>
                    </button>
                  ) : (
                    <button
                      key={task.id}
                      className={`planner-task planner-task--quick ${task.done ? "is-done" : ""}`}
                      onClick={() => onToggleQuickTask(day.id, task.id)}
                      type="button"
                    >
                      <strong>{task.title}</strong>
                      <span>Личная заметка</span>
                    </button>
                  ),
                )}
              </div>
              <div className="inline-form">
                <input
                  className="field"
                  onChange={(event) => onChangeQuickTaskDraft(day.id, event.target.value)}
                  placeholder="Добавить личную задачу"
                  value={quickTaskDrafts[day.id] ?? ""}
                />
                <button className="button button--ghost" onClick={() => onAddQuickTask(day.id)} type="button">
                  Добавить
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel goal-map-panel">
        <div className="panel-head">
          <div>
            <p className="section-kicker">Карта целей</p>
            <h3>Активные контуры на ближайшие {plannerRadius} дней</h3>
          </div>
          <button className="button button--primary" onClick={onCreateGoal} type="button">
            Новая цель
          </button>
        </div>

        <div className="goal-map">
          <div className="goal-map__core">Мои цели</div>
          {orbitGoals.map((goal, index) => (
            <button
              key={goal.id}
              className={`goal-orbit ${selectedGoal?.id === goal.id ? "is-active" : ""}`}
              onClick={() => onSelectGoal(goal.id)}
              style={{
                left: `${orbitPositions[index]?.left ?? 50}%`,
                top: `${orbitPositions[index]?.top ?? 50}%`,
                "--orbit-accent": SPHERE_META[goal.sphere].color,
              }}
              type="button"
            >
              <strong>{goal.title}</strong>
              <span>{goalProgress(goal)}%</span>
            </button>
          ))}
        </div>

        <div className="radius-control">
          <label htmlFor="radius">Горизонт планирования</label>
          <input
            id="radius"
            max="90"
            min="7"
            onChange={(event) => onChangeRadius(Number(event.target.value))}
            type="range"
            value={plannerRadius}
          />
          <strong>{plannerRadius} дней</strong>
        </div>

        <div className="goal-list goal-list--compact">
          {allGoals.map((goal) => (
            <button key={goal.id} className="goal-card goal-card--compact" onClick={() => onSelectGoal(goal.id)} type="button">
              <div className="goal-card__head">
                <strong>{goal.title}</strong>
                <span className={`status-pill status-pill--${getGoalStatusTone(goal.status)}`}>
                  {getGoalStatusLabel(goal.status)}
                </span>
              </div>
              <p>{goal.metric}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="panel goal-detail-panel">
        {selectedGoal ? (
          <>
            <p className="section-kicker">Выбранная цель</p>
            <div className="goal-detail__head">
              <h3>{selectedGoal.title}</h3>
              <span className={`status-pill status-pill--${getGoalStatusTone(selectedGoal.status)}`}>
                {getGoalStatusLabel(selectedGoal.status)}
              </span>
            </div>
            <p>{selectedGoal.why}</p>
            <ul className="focus-list">
              <li>Метрика: {selectedGoal.metric}</li>
              <li>Срок: до {formatDate(selectedGoal.dueDate)}</li>
              <li>Теги: {selectedGoal.tags.join(", ")}</li>
            </ul>
            <div className="stage-list">
              {selectedGoal.stages.map((stage) => (
                <div key={stage.id} className={`stage-item ${stage.done ? "is-done" : ""}`}>
                  <div>
                    <strong>{stage.title}</strong>
                    <span>{WEEK_DAYS.find((day) => day.id === stage.weekday)?.label}</span>
                  </div>
                  <button
                    className="button button--ghost"
                    disabled={stage.done}
                    onClick={() => onCompleteStage(selectedGoal.id, stage.id)}
                    type="button"
                  >
                    {stage.done ? "Готово" : "Закрыть этап"}
                  </button>
                </div>
              ))}
            </div>
            <div className="panel-actions">
              <button className="button button--primary" onClick={() => onEditGoal(selectedGoal.id)} type="button">
                Редактировать
              </button>
              <button className="button button--ghost" onClick={() => onOpenGroup(selectedGoal.groupId)} type="button">
                Открыть группу поддержки
              </button>
            </div>
          </>
        ) : (
          <p>Выбери цель, чтобы увидеть этапы и связанные действия.</p>
        )}
      </section>
    </div>
  );
}

function ConstructorView({
  draft,
  draftMode,
  constructorStep,
  constructorError,
  contacts,
  groups,
  onSetStep,
  onChangeField,
  onChangeStage,
  onAddStage,
  onRemoveStage,
  onBack,
  onNext,
  onSave,
}) {
  const currentGroup = groups.find((group) => group.id === draft.groupId);
  const mentor = contacts.find((contact) => contact.id === draft.mentorId);
  const mentee = contacts.find((contact) => contact.id === draft.menteeId);

  return (
    <div className="view-grid constructor-view">
      <section className="panel constructor-panel">
        <div className="panel-head">
          <div>
            <p className="section-kicker">{draftMode === "edit" ? "Редактирование" : "Новая цель"}</p>
            <h3>Собери цель без внутренних противоречий</h3>
          </div>
          <span className="status-pill status-pill--info">Шаг {constructorStep} из 4</span>
        </div>

        <div className="stepper">
          {[
            { step: 1, label: "Смысл" },
            { step: 2, label: "Этапы" },
            { step: 3, label: "Ресурсы" },
            { step: 4, label: "Пары" },
          ].map((item) => (
            <button
              key={item.step}
              className={`stepper-item ${constructorStep === item.step ? "is-current" : ""} ${constructorStep > item.step ? "is-done" : ""}`}
              onClick={() => onSetStep(item.step)}
              type="button"
            >
              <span>{item.step}</span>
              <strong>{item.label}</strong>
            </button>
          ))}
        </div>

        {constructorStep === 1 ? (
          <div className="form-grid">
            <label className="field-group">
              <span>Название цели</span>
              <input className="field" onChange={(event) => onChangeField("title", event.target.value)} value={draft.title} />
            </label>
            <label className="field-group">
              <span>Сфера жизни</span>
              <select className="field" onChange={(event) => onChangeField("sphere", event.target.value)} value={draft.sphere}>
                {SPHERE_ORDER.map((sphereId) => (
                  <option key={sphereId} value={sphereId}>
                    {SPHERE_META[sphereId].label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-group field-group--full">
              <span>Почему эта цель нужна</span>
              <textarea
                className="field field--textarea"
                onChange={(event) => onChangeField("why", event.target.value)}
                value={draft.why}
              />
            </label>
            <label className="field-group">
              <span>Критерий выполненности</span>
              <input className="field" onChange={(event) => onChangeField("metric", event.target.value)} value={draft.metric} />
            </label>
            <label className="field-group">
              <span>Срок</span>
              <input className="field" onChange={(event) => onChangeField("dueDate", event.target.value)} type="date" value={draft.dueDate} />
            </label>
          </div>
        ) : null}

        {constructorStep === 2 ? (
          <div className="form-grid">
            <label className="field-group">
              <span>Группа поддержки</span>
              <select className="field" onChange={(event) => onChangeField("groupId", event.target.value)} value={draft.groupId}>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-group">
              <span>Теги</span>
              <input
                className="field"
                onChange={(event) => onChangeField("tagText", event.target.value)}
                placeholder="ритм, фокус, здоровье"
                value={draft.tagText}
              />
            </label>
            <label className="field-group field-group--full">
              <span>Комментарии к цели</span>
              <textarea
                className="field field--textarea"
                onChange={(event) => onChangeField("notes", event.target.value)}
                value={draft.notes}
              />
            </label>
            <div className="field-group field-group--full">
              <div className="panel-head panel-head--compact">
                <span>Этапы</span>
                <button className="button button--ghost" onClick={onAddStage} type="button">
                  Добавить этап
                </button>
              </div>
              <div className="stage-editor-list">
                {draft.stages.map((stage) => (
                  <div key={stage.id} className="stage-editor-row">
                    <input
                      className="field"
                      onChange={(event) => onChangeStage(stage.id, "title", event.target.value)}
                      placeholder="Название этапа"
                      value={stage.title}
                    />
                    <select
                      className="field"
                      onChange={(event) => onChangeStage(stage.id, "weekday", event.target.value)}
                      value={stage.weekday}
                    >
                      {WEEK_DAYS.map((day) => (
                        <option key={day.id} value={day.id}>
                          {day.label}
                        </option>
                      ))}
                    </select>
                    <button className="button button--ghost" onClick={() => onRemoveStage(stage.id)} type="button">
                      Убрать
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {constructorStep === 3 ? (
          <div className="form-grid">
            <label className="field-group">
              <span>Менто</span>
              <input
                className="field"
                min="0"
                onChange={(event) => onChangeField("mentoCost", event.target.value)}
                type="number"
                value={draft.mentoCost}
              />
            </label>
            <label className="field-group">
              <span>Интеллект</span>
              <input
                className="field"
                min="0"
                onChange={(event) => onChangeField("intellectCost", event.target.value)}
                type="number"
                value={draft.intellectCost}
              />
            </label>
            <label className="field-group">
              <span>Активность</span>
              <input
                className="field"
                min="0"
                onChange={(event) => onChangeField("activityCost", event.target.value)}
                type="number"
                value={draft.activityCost}
              />
            </label>
            <label className="field-group">
              <span>Информативность</span>
              <input
                className="field"
                min="0"
                onChange={(event) => onChangeField("informativeCost", event.target.value)}
                type="number"
                value={draft.informativeCost}
              />
            </label>
            <label className="field-group">
              <span>Статус на старте</span>
              <select className="field" onChange={(event) => onChangeField("status", event.target.value)} value={draft.status}>
                <option value="active">В работе</option>
                <option value="planned">Запланирована</option>
                <option value="paused">На паузе</option>
              </select>
            </label>
            <div className="summary-card">
              <strong>Что произойдет после сохранения</strong>
              <p>
                Цель попадет в планнер по выбранным дням, появится в карте целей и сразу привяжется к группе поддержки.
              </p>
            </div>
          </div>
        ) : null}

        {constructorStep === 4 ? (
          <div className="form-grid">
            <label className="field-group">
              <span>Ментор</span>
              <select className="field" onChange={(event) => onChangeField("mentorId", event.target.value)} value={draft.mentorId}>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-group">
              <span>Мэйдей</span>
              <select className="field" onChange={(event) => onChangeField("menteeId", event.target.value)} value={draft.menteeId}>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="summary-card field-group--full">
              <strong>Проверка связности</strong>
              <ul className="focus-list">
                <li>Смысл: {draft.why || "пока не заполнен"}</li>
                <li>Группа: {currentGroup?.name ?? "не выбрана"}</li>
                <li>Пара: {mentor?.name ?? "—"} / {mentee?.name ?? "—"}</li>
                <li>Этапов: {draft.stages.filter((stage) => stage.title.trim()).length}</li>
              </ul>
            </div>
          </div>
        ) : null}

        {constructorError ? <div className="notice notice--warning">{constructorError}</div> : null}

        <div className="panel-actions">
          <button className="button button--ghost" onClick={onBack} type="button">
            Назад
          </button>
          {constructorStep < 4 ? (
            <button className="button button--primary" onClick={onNext} type="button">
              Дальше
            </button>
          ) : (
            <button className="button button--primary" onClick={onSave} type="button">
              Сохранить цель
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

function ContactsView({
  visibleContacts,
  selectedContact,
  relatedGoals,
  contactQuery,
  onChangeContactQuery,
  onSelectContact,
  messageDraft,
  onChangeMessageDraft,
  onSendMessage,
  onTransferMento,
  onOpenGoal,
}) {
  const contactsById = Object.fromEntries(visibleContacts.map((contact) => [contact.id, contact]));
  const lines = [
    ["c1", "c2"],
    ["c1", "c3"],
    ["c2", "c3"],
    ["c3", "c4"],
    ["c1", "c4"],
  ].filter(([from, to]) => contactsById[from] && contactsById[to]);

  return (
    <div className="view-grid contacts-view">
      <section className="panel contacts-map-panel">
        <div className="panel-head">
          <div>
            <p className="section-kicker">Контактная сеть</p>
            <h3>Люди, с которыми связаны текущие цели</h3>
          </div>
          <input
            className="field field--compact"
            onChange={(event) => onChangeContactQuery(event.target.value)}
            placeholder="Поиск контакта"
            value={contactQuery}
          />
        </div>

        <div className="contacts-map">
          <svg className="contacts-map__lines" preserveAspectRatio="none" viewBox="0 0 100 100">
            {lines.map(([from, to]) => (
              <line
                key={`${from}-${to}`}
                x1={contactsById[from].x}
                x2={contactsById[to].x}
                y1={contactsById[from].y}
                y2={contactsById[to].y}
              />
            ))}
          </svg>
          {visibleContacts.map((contact) => (
            <button
              key={contact.id}
              className={`contact-node ${selectedContact?.id === contact.id ? "is-active" : ""}`}
              onClick={() => onSelectContact(contact.id)}
              style={{ left: `${contact.x}%`, top: `${contact.y}%`, "--accent": contact.accent }}
              type="button"
            >
              <div className="contact-node__avatar">{contact.name.slice(0, 1)}</div>
              <strong>{contact.name}</strong>
              <span>{contact.role}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="panel contact-detail-panel">
        {selectedContact ? (
          <>
            <p className="section-kicker">Профиль контакта</p>
            <h3>{selectedContact.name}</h3>
            <p>{selectedContact.focus}</p>
            <ul className="focus-list">
              <li>Роль: {selectedContact.role}</li>
              <li>Кредо: {selectedContact.credo}</li>
              <li>Поддержка в менто: {selectedContact.support}</li>
            </ul>

            <div className="panel-actions">
              <button className="button button--ghost" onClick={() => onTransferMento(selectedContact.id, 3)} type="button">
                Передать 3 менто
              </button>
            </div>

            <div className="related-goals">
              <strong>Общие цели</strong>
              {relatedGoals.length ? (
                relatedGoals.map((goal) => (
                  <button key={goal.id} className="goal-inline-card" onClick={() => onOpenGoal(goal.id)} type="button">
                    {goal.title}
                  </button>
                ))
              ) : (
                <p>Пока нет целей, связанных с этим контактом.</p>
              )}
            </div>

            <div className="chat-panel">
              <div className="chat-panel__messages">
                {selectedContact.messages.map((message) => (
                  <article
                    key={message.id}
                    className={`chat-bubble ${message.author === USER_ID ? "is-own" : ""}`}
                  >
                    <p>{message.text}</p>
                    <span>{message.time}</span>
                  </article>
                ))}
              </div>
              <div className="inline-form inline-form--stack">
                <textarea
                  className="field field--textarea field--compact"
                  onChange={(event) => onChangeMessageDraft(event.target.value)}
                  placeholder="Сообщение ментору или мэйдею"
                  value={messageDraft}
                />
                <button className="button button--primary" onClick={onSendMessage} type="button">
                  Отправить
                </button>
              </div>
            </div>
          </>
        ) : (
          <p>Выбери контакт, чтобы увидеть сообщения и связанные цели.</p>
        )}
      </section>
    </div>
  );
}

function FeedView({
  reminders,
  recentEvents,
  visiblePosts,
  selectedPost,
  postQuery,
  postDraft,
  joinedGroups,
  onChangePostQuery,
  onSelectPost,
  onToggleLike,
  onSavePost,
  onCollectSticker,
  onUnlockPost,
  onChangePostDraft,
  onCreatePost,
  onOpenGroup,
}) {
  return (
    <div className="view-grid feed-view">
      <section className="panel reminders-panel">
        <p className="section-kicker">Напоминания недели</p>
        <div className="reminder-list">
          {reminders.length ? (
            reminders.map((reminder) => (
              <article key={reminder.id} className="reminder-card" style={{ "--accent": SPHERE_META[reminder.sphere].color }}>
                <strong>{reminder.dayLabel}</strong>
                <h3>{reminder.title}</h3>
                <p>{reminder.goalTitle}</p>
              </article>
            ))
          ) : (
            <p>Все ближайшие этапы уже закрыты. Можно либо создать новую цель, либо расширить текущий план.</p>
          )}
        </div>

        <div className="events-list">
          {recentEvents.map((event) => (
            <div key={event.id} className="event-item">
              <strong>{event.title}</strong>
              <span>{event.detail}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel posts-panel">
        <div className="panel-head">
          <div>
            <p className="section-kicker">Посты из подключенных групп</p>
            <h3>Материалы, которые влияют на текущий ритм</h3>
          </div>
          <input
            className="field field--compact"
            onChange={(event) => onChangePostQuery(event.target.value)}
            placeholder="Поиск по постам"
            value={postQuery}
          />
        </div>
        <div className="post-grid">
          {visiblePosts.map((post) => (
            <button
              key={post.id}
              className={`post-card ${selectedPost?.id === post.id ? "is-active" : ""}`}
              onClick={() => onSelectPost(post.id)}
              type="button"
            >
              <div className="post-card__meta">
                <span className="hex-badge" style={{ "--badge-accent": SPHERE_META[post.sphere].color }}>
                  {POST_TYPES.find((item) => item.id === post.type)?.label ?? post.type}
                </span>
                <span>{post.views} просмотров</span>
              </div>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <div className="post-card__footer">
                <span>{post.authorName}</span>
                <strong>{post.likes} ❤</strong>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="panel feed-detail-panel">
        {selectedPost ? (
          <>
            <p className="section-kicker">Выбранный пост</p>
            <h3>{selectedPost.title}</h3>
            <p>{selectedPost.excerpt}</p>
            <ul className="focus-list">
              <li>Автор: {selectedPost.authorName}</li>
              <li>Тип: {POST_TYPES.find((item) => item.id === selectedPost.type)?.label}</li>
              <li>Сфера: {SPHERE_META[selectedPost.sphere].label}</li>
            </ul>

            <div className="panel-actions panel-actions--wrap">
              <button className="button button--ghost" onClick={() => onToggleLike(selectedPost.id)} type="button">
                {selectedPost.likedByUser ? "Убрать лайк" : "Поставить лайк"}
              </button>
              <button className="button button--ghost" disabled={selectedPost.savedToFormer} onClick={() => onSavePost(selectedPost.id)} type="button">
                {selectedPost.savedToFormer ? "Сохранено в формер" : "Сохранить в лайфхаки"}
              </button>
              <button
                className="button button--ghost"
                disabled={selectedPost.stickerCollected || (selectedPost.isSecret && !selectedPost.unlocked)}
                onClick={() => onCollectSticker(selectedPost.id)}
                type="button"
              >
                {selectedPost.stickerCollected ? "Стикер собран" : "Собрать стикер"}
              </button>
              {selectedPost.isSecret && !selectedPost.unlocked ? (
                <button className="button button--primary" onClick={() => onUnlockPost(selectedPost.id)} type="button">
                  Открыть за 4 менто
                </button>
              ) : null}
              <button className="button button--ghost" onClick={() => onOpenGroup(selectedPost.groupId)} type="button">
                Открыть группу
              </button>
            </div>
          </>
        ) : null}

        <div className="composer-panel">
          <p className="section-kicker">Новый пост</p>
          <div className="form-grid">
            <label className="field-group">
              <span>Группа</span>
              <select
                className="field"
                onChange={(event) => onChangePostDraft("groupId", event.target.value)}
                value={postDraft.groupId}
              >
                {joinedGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-group">
              <span>Тип</span>
              <select className="field" onChange={(event) => onChangePostDraft("type", event.target.value)} value={postDraft.type}>
                {POST_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-group field-group--full">
              <span>Заголовок</span>
              <input className="field" onChange={(event) => onChangePostDraft("title", event.target.value)} value={postDraft.title} />
            </label>
            <label className="field-group field-group--full">
              <span>Краткий текст</span>
              <textarea
                className="field field--textarea"
                onChange={(event) => onChangePostDraft("excerpt", event.target.value)}
                value={postDraft.excerpt}
              />
            </label>
          </div>
          <div className="panel-actions">
            <button className="button button--primary" onClick={onCreatePost} type="button">
              Опубликовать
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function GroupsView({
  groups,
  selectedGroup,
  groupPosts,
  relatedGoalsForGroup,
  onSelectGroup,
  onToggleJoin,
  onOpenFeed,
  onCreateGoalFromGroup,
}) {
  const grouped = SPHERE_ORDER.map((sphereId) => ({
    id: sphereId,
    label: SPHERE_META[sphereId].label,
    color: SPHERE_META[sphereId].color,
    groups: groups.filter((group) => group.sphere === sphereId),
  }));

  return (
    <div className="view-grid groups-view">
      <section className="panel groups-overview-panel">
        <p className="section-kicker">Группы по сферам жизни</p>
        <div className="group-lanes">
          {grouped.map((lane) => (
            <div key={lane.id} className="group-lane" style={{ "--accent": lane.color }}>
              <h3>{lane.label}</h3>
              <div className="group-lane__list">
                {lane.groups.map((group) => (
                  <article key={group.id} className={`group-card ${selectedGroup?.id === group.id ? "is-active" : ""}`}>
                    <button className="group-card__main" onClick={() => onSelectGroup(group.id)} type="button">
                      <strong>{group.name}</strong>
                      <span>{group.description}</span>
                    </button>
                    <div className="group-card__footer">
                      <span>{group.members} участников</span>
                      <button className="button button--ghost" onClick={() => onToggleJoin(group.id)} type="button">
                        {group.joined ? "В ленте" : "Подписаться"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel group-detail-panel">
        {selectedGroup ? (
          <>
            <p className="section-kicker">Выбранная группа</p>
            <h3>{selectedGroup.name}</h3>
            <p>{selectedGroup.description}</p>
            <ul className="focus-list">
              <li>Кредо: {selectedGroup.credo}</li>
              <li>Участников: {selectedGroup.members}</li>
              <li>Постов за неделю: {selectedGroup.weeklyPosts}</li>
            </ul>

            <div className="panel-actions panel-actions--wrap">
              <button className="button button--primary" onClick={() => onOpenFeed(selectedGroup.id)} type="button">
                Перейти к постам группы
              </button>
              <button className="button button--ghost" onClick={() => onCreateGoalFromGroup(selectedGroup.id)} type="button">
                Создать цель из этой группы
              </button>
            </div>

            <div className="related-goals">
              <strong>Связанные цели</strong>
              {relatedGoalsForGroup.length ? (
                relatedGoalsForGroup.map((goal) => (
                  <span key={goal.id} className="goal-inline-card">
                    {goal.title}
                  </span>
                ))
              ) : (
                <p>Пока ни одна цель не привязана к этой группе.</p>
              )}
            </div>

            <div className="group-post-list">
              {groupPosts.map((post) => (
                <article key={post.id} className="event-item">
                  <strong>{post.title}</strong>
                  <span>{post.authorName}</span>
                </article>
              ))}
            </div>
          </>
        ) : (
          <p>Выбери группу, чтобы увидеть ее роли в общей стратегии.</p>
        )}
      </section>
    </div>
  );
}

function ActiveView(props) {
  switch (props.activeModule) {
    case "former":
      return <FormerView {...props} />;
    case "goals":
      return <GoalsView {...props} />;
    case "constructor":
      return <ConstructorView {...props} />;
    case "contacts":
      return <ContactsView {...props} />;
    case "feed":
      return <FeedView {...props} />;
    case "groups":
      return <GroupsView {...props} />;
    case "profile":
    default:
      return <ProfileView {...props} />;
  }
}

export default function MentoristPrototype() {
  const [state, setState] = useState(() => createInitialState());
  const [activeModule, setActiveModule] = useState("profile");
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [selectedFormerSectionId, setSelectedFormerSectionId] = useState(FORMER_SECTION_DEFS[0].id);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [formerDraft, setFormerDraft] = useState("");
  const [goalDraft, setGoalDraft] = useState(() => createEmptyGoalDraft());
  const [draftMode, setDraftMode] = useState("create");
  const [constructorStep, setConstructorStep] = useState(1);
  const [constructorError, setConstructorError] = useState("");
  const [quickTaskDrafts, setQuickTaskDrafts] = useState({});
  const [messageDraft, setMessageDraft] = useState("");
  const [contactQuery, setContactQuery] = useState("");
  const [postQuery, setPostQuery] = useState("");
  const [postDraft, setPostDraft] = useState({
    groupId: "",
    type: "guide",
    title: "",
    excerpt: "",
  });
  const [notice, setNotice] = useState({
    tone: "info",
    text: "Демо-данные можно свободно менять: добавляй цели, закрывай этапы, пиши в чаты и публикуй посты.",
  });
  const [storageReady, setStorageReady] = useState(false);

  const deferredContactQuery = useDeferredValue(contactQuery);
  const deferredPostQuery = useDeferredValue(postQuery);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setState(JSON.parse(raw));
      }
    } catch {
      // Ignore corrupted local storage and keep demo defaults.
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, storageReady]);

  useEffect(() => {
    if (!state.goals.some((goal) => goal.id === selectedGoalId)) {
      setSelectedGoalId(state.goals[0]?.id ?? null);
    }
  }, [selectedGoalId, state.goals]);

  useEffect(() => {
    if (!state.contacts.some((contact) => contact.id === selectedContactId)) {
      setSelectedContactId(state.contacts[0]?.id ?? null);
    }
  }, [selectedContactId, state.contacts]);

  useEffect(() => {
    if (!state.groups.some((group) => group.id === selectedGroupId)) {
      setSelectedGroupId(state.groups[0]?.id ?? null);
    }
  }, [selectedGroupId, state.groups]);

  useEffect(() => {
    const joinedGroupIds = new Set(state.groups.filter((group) => group.joined).map((group) => group.id));
    const visiblePosts = state.posts.filter((post) => joinedGroupIds.has(post.groupId));
    if (!visiblePosts.some((post) => post.id === selectedPostId)) {
      setSelectedPostId(visiblePosts[0]?.id ?? state.posts[0]?.id ?? null);
    }
  }, [selectedPostId, state.groups, state.posts]);

  useEffect(() => {
    setFormerDraft(state.former.sections[selectedFormerSectionId] ?? "");
  }, [selectedFormerSectionId, state.former.sections]);

  useEffect(() => {
    if (!postDraft.groupId && state.groups.length) {
      setPostDraft((current) => ({
        ...current,
        groupId: state.groups.find((group) => group.joined)?.id ?? state.groups[0].id,
      }));
    }
  }, [postDraft.groupId, state.groups]);

  useEffect(() => {
    const firstJoinedGroup = state.groups.find((group) => group.joined)?.id ?? "";
    if (postDraft.groupId && state.groups.some((group) => group.joined && group.id === postDraft.groupId)) {
      return;
    }

    if (firstJoinedGroup) {
      setPostDraft((current) => ({
        ...current,
        groupId: firstJoinedGroup,
      }));
    }
  }, [postDraft.groupId, state.groups]);

  const sphereCards = getSphereCards(state);
  const averageBalance = getAverageBalance(state.spheres);
  const semanticWords = buildSemanticWords(state);
  const formerNavigation = buildFormerNavigation(state);
  const plannerDays = buildPlannerDays(state.goals, state.planner);
  const nextReminder = getFirstReminder(plannerDays);
  const unreadMessages = countUnreadMessages(state.contacts);
  const joinedGroups = state.groups.filter((group) => group.joined);
  const activeGoals = state.goals.filter((goal) => goal.status === "active");

  const visibleContacts = state.contacts.filter((contact) => {
    const query = deferredContactQuery.trim().toLowerCase();
    if (!query) {
      return true;
    }

    return `${contact.name} ${contact.role} ${contact.focus}`.toLowerCase().includes(query);
  });

  const visiblePosts = state.posts.filter((post) => {
    const group = findGroupById(state, post.groupId);
    if (!group?.joined) {
      return false;
    }

    const query = deferredPostQuery.trim().toLowerCase();
    if (!query) {
      return true;
    }

    return `${post.title} ${post.excerpt} ${post.authorName}`.toLowerCase().includes(query);
  });

  const selectedGoal = state.goals.find((goal) => goal.id === selectedGoalId) ?? null;
  const selectedContact = state.contacts.find((contact) => contact.id === selectedContactId) ?? null;
  const selectedGroup = state.groups.find((group) => group.id === selectedGroupId) ?? null;
  const selectedPost = state.posts.find((post) => post.id === selectedPostId) ?? null;
  const relatedGoalsForContact = selectedContact
    ? state.goals.filter((goal) => goal.mentorId === selectedContact.id || goal.menteeId === selectedContact.id)
    : [];
  const relatedGoalsForGroup = selectedGroup
    ? state.goals.filter((goal) => goal.groupId === selectedGroup.id)
    : [];
  const groupPosts = selectedGroup ? state.posts.filter((post) => post.groupId === selectedGroup.id) : [];

  function pushNotice(text, tone = "info") {
    setNotice({ text, tone });
  }

  function navigate(module) {
    startTransition(() => {
      setActiveModule(module);
    });
  }

  function resetDemo() {
    const freshState = createInitialState();
    setState(freshState);
    setDraftMode("create");
    setGoalDraft(createEmptyGoalDraft());
    setConstructorStep(1);
    setConstructorError("");
    pushNotice("Демо-кабинет сброшен к исходным тестовым данным.", "success");
    if (storageReady) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }

  function openGoal(goalId) {
    setSelectedGoalId(goalId);
    navigate("goals");
  }

  function openNewGoal(prefill = {}) {
    const emptyDraft = createEmptyGoalDraft();
    const targetGroupId =
      prefill.groupId ??
      selectedGroupId ??
      state.groups.find((group) => group.joined)?.id ??
      emptyDraft.groupId;
    const targetGroup = findGroupById(state, targetGroupId);

    setGoalDraft({
      ...emptyDraft,
      groupId: targetGroupId,
      why: prefill.why ?? emptyDraft.why,
      sphere: prefill.sphere ?? targetGroup?.sphere ?? emptyDraft.sphere,
      tagText: prefill.tagText ?? emptyDraft.tagText,
    });
    setDraftMode("create");
    setConstructorStep(1);
    setConstructorError("");
    navigate("constructor");
  }

  function openEditGoal(goalId) {
    const goal = state.goals.find((item) => item.id === goalId);
    if (!goal) {
      return;
    }

    setGoalDraft(createDraftFromGoal(goal));
    setDraftMode("edit");
    setConstructorStep(1);
    setConstructorError("");
    navigate("constructor");
  }

  function saveFormerSection() {
    const sectionDefinition = FORMER_SECTION_DEFS.find((item) => item.id === selectedFormerSectionId);
    const nextContent = formerDraft.trim();

    setState((current) =>
      prependEvent(
        {
          ...current,
          former: {
            ...current.former,
            sections: {
              ...current.former.sections,
              [selectedFormerSectionId]: nextContent,
            },
          },
        },
        createEvent(
          `Обновлен раздел «${sectionDefinition?.label ?? "Формер"}»`,
          "Изменения сразу влияют на семантическое ядро и становятся доступны при постановке новых целей.",
          "#52d6ff",
        ),
      ),
    );

    pushNotice(`Раздел «${sectionDefinition?.label ?? "Формер"}» сохранен.`, "success");
  }

  function moveFormerToConstructor() {
    const sectionDefinition = FORMER_SECTION_DEFS.find((item) => item.id === selectedFormerSectionId);
    openNewGoal({
      why: formerDraft.slice(0, 240),
      tagText: sectionDefinition?.label === "Ценности" ? parseLines(formerDraft).slice(0, 3).join(", ") : "опора, смысл",
    });
    pushNotice("Содержимое раздела перенесено в черновик новой цели.", "info");
  }

  function changeGoalDraft(field, value) {
    setGoalDraft((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function changeDraftStage(stageId, field, value) {
    setGoalDraft((current) => ({
      ...current,
      stages: current.stages.map((stage) => (stage.id === stageId ? { ...stage, [field]: value } : stage)),
    }));
  }

  function addDraftStage() {
    setGoalDraft((current) => ({
      ...current,
      stages: [
        ...current.stages,
        {
          id: createId("draft-stage"),
          title: "",
          weekday: "mon",
        },
      ],
    }));
  }

  function removeDraftStage(stageId) {
    setGoalDraft((current) => ({
      ...current,
      stages: current.stages.filter((stage) => stage.id !== stageId),
    }));
  }

  function saveGoalDraft() {
    const existingGoal = state.goals.find((goal) => goal.id === goalDraft.id);
    const nextGoal = draftToGoal(goalDraft, existingGoal);

    if (!nextGoal.title || !nextGoal.why || !nextGoal.metric) {
      setConstructorError("Заполни название, смысл и критерий выполненности цели.");
      return;
    }

    if (nextGoal.stages.length < 2) {
      setConstructorError("У цели должно быть как минимум два осмысленных этапа.");
      return;
    }

    if (!existingGoal && state.energies.mento < nextGoal.resourceCost.mento) {
      setConstructorError("Недостаточно менто для новой цели. Уменьши стоимость или пополни баланс через действия.");
      return;
    }

    setState((current) => {
      const joinedGroupsPatch = current.groups.map((group) =>
        group.id === nextGoal.groupId ? { ...group, joined: true } : group,
      );

      if (existingGoal) {
        return prependEvent(
          {
            ...current,
            goals: current.goals.map((goal) => (goal.id === existingGoal.id ? nextGoal : goal)),
            groups: joinedGroupsPatch,
          },
          createEvent(
            `Цель «${nextGoal.title}» обновлена`,
            "Конструктор синхронизировал изменения с планнером и группой поддержки.",
            SPHERE_META[nextGoal.sphere].color,
          ),
        );
      }

      return prependEvent(
        {
          ...current,
          goals: [nextGoal, ...current.goals],
          groups: joinedGroupsPatch,
          energies: applyEnergyDelta(current.energies, {
            mento: -nextGoal.resourceCost.mento,
            intellect: -nextGoal.resourceCost.intellect,
            activity: -nextGoal.resourceCost.activity,
            informative: -nextGoal.resourceCost.informative,
          }),
        },
        createEvent(
          `Создана цель «${nextGoal.title}»`,
          "Цель появилась в карте, этапы распределены по неделе, а стоимость списана с энергий.",
          SPHERE_META[nextGoal.sphere].color,
        ),
      );
    });

    setSelectedGoalId(nextGoal.id);
    setSelectedGroupId(nextGoal.groupId);
    setDraftMode("create");
    setGoalDraft(createEmptyGoalDraft());
    setConstructorStep(1);
    setConstructorError("");
    pushNotice(`Цель «${nextGoal.title}» сохранена и добавлена в рабочий контур.`, "success");
    navigate("goals");
  }

  function completeStage(goalId, stageId) {
    const goal = state.goals.find((item) => item.id === goalId);
    const stage = goal?.stages.find((item) => item.id === stageId);

    if (!goal || !stage || stage.done) {
      return;
    }

    setState((current) => {
      let finishedGoalTitle = goal.title;
      let finishedGoalSphere = goal.sphere;
      let completedGoalFully = false;

      const updatedGoals = current.goals.map((item) => {
        if (item.id !== goalId) {
          return item;
        }

        const stages = item.stages.map((stageItem) =>
          stageItem.id === stageId ? { ...stageItem, done: true } : stageItem,
        );
        completedGoalFully = stages.every((stageItem) => stageItem.done);

        return {
          ...item,
          stages,
          status: completedGoalFully ? "completed" : item.status,
        };
      });

      const energyDelta = completedGoalFully
        ? { activity: 6, intellect: 2, informative: 2, mento: goal.resourceCost.mento }
        : { activity: 4, intellect: 1, informative: 1, mento: 2 };

      const updatedSpheres = completedGoalFully
        ? {
            ...current.spheres,
            [finishedGoalSphere]: clamp(current.spheres[finishedGoalSphere] + 6, 0, 100),
          }
        : current.spheres;

      const nextState = {
        ...current,
        goals: updatedGoals,
        spheres: updatedSpheres,
        energies: applyEnergyDelta(current.energies, energyDelta),
      };

      return prependEvent(
        nextState,
        createEvent(
          completedGoalFully
            ? `Цель «${finishedGoalTitle}» завершена`
            : `Этап по цели «${finishedGoalTitle}» закрыт`,
          completedGoalFully
            ? "Финальный этап закрыт: ментo возвращено с прибавкой, а сфера получила заметный прирост."
            : "Этап выполнен и сразу усилил активность, интеллект и общую динамику недели.",
          SPHERE_META[finishedGoalSphere].color,
        ),
      );
    });

    pushNotice(`Этап «${stage.title}» отмечен как выполненный.`, "success");
  }

  function changePlannerRadius(value) {
    setState((current) => ({
      ...current,
      planner: {
        ...current.planner,
        radius: value,
      },
    }));
  }

  function changeQuickTaskDraft(dayId, value) {
    setQuickTaskDrafts((current) => ({
      ...current,
      [dayId]: value,
    }));
  }

  function addQuickTask(dayId) {
    const title = (quickTaskDrafts[dayId] ?? "").trim();
    if (!title) {
      pushNotice("Сначала введи текст личной задачи для планнера.", "warning");
      return;
    }

    setState((current) =>
      prependEvent(
        {
          ...current,
          planner: {
            ...current.planner,
            notesByDay: {
              ...current.planner.notesByDay,
              [dayId]: [
                ...(current.planner.notesByDay[dayId] ?? []),
                { id: createId("quick-task"), title, done: false },
              ],
            },
          },
        },
        createEvent("В планнер добавлена личная задача", `Новый слот закреплен на ${WEEK_DAYS.find((day) => day.id === dayId)?.label?.toLowerCase()}.`, "#ffc247"),
      ),
    );

    setQuickTaskDrafts((current) => ({
      ...current,
      [dayId]: "",
    }));
  }

  function toggleQuickTask(dayId, taskId) {
    setState((current) => ({
      ...current,
      planner: {
        ...current.planner,
        notesByDay: {
          ...current.planner.notesByDay,
          [dayId]: (current.planner.notesByDay[dayId] ?? []).map((task) =>
            task.id === taskId ? { ...task, done: !task.done } : task,
          ),
        },
      },
    }));
  }

  function selectContact(contactId) {
    setSelectedContactId(contactId);
    setState((current) => ({
      ...current,
      contacts: current.contacts.map((contact) =>
        contact.id === contactId
          ? {
              ...contact,
              messages: contact.messages.map((message) =>
                message.author === USER_ID ? message : { ...message, read: true },
              ),
            }
          : contact,
      ),
    }));
  }

  function sendMessage() {
    const text = messageDraft.trim();
    if (!selectedContact || !text) {
      pushNotice("Выбери контакт и введи сообщение.", "warning");
      return;
    }

    const contactId = selectedContact.id;
    const ownMessage = {
      id: createId("msg"),
      author: USER_ID,
      text,
      time: formatTime(),
      read: true,
    };

    setState((current) =>
      prependEvent(
        {
          ...current,
          contacts: current.contacts.map((contact) =>
            contact.id === contactId
              ? { ...contact, messages: [...contact.messages, ownMessage] }
              : contact,
          ),
        },
        createEvent(
          `Отправлено сообщение контакту «${selectedContact.name}»`,
          "Переписка осталась внутри рабочего контура и не потеряла связь с целями.",
          selectedContact.accent,
        ),
      ),
    );
    setMessageDraft("");

    window.setTimeout(() => {
      setState((current) => ({
        ...current,
        contacts: current.contacts.map((contact) => {
          if (contact.id !== contactId) {
            return contact;
          }

          return {
            ...contact,
            messages: [
              ...contact.messages,
              {
                id: createId("msg"),
                author: contactId,
                text: CONTACT_REPLY_LIBRARY[contactId] ?? "Держи курс. Главное — не размазывать внимание.",
                time: formatTime(),
                read: activeModule === "contacts" && selectedContactId === contactId,
              },
            ],
          };
        }),
      }));
    }, 700);
  }

  function transferMento(contactId, amount) {
    if (state.energies.mento < amount) {
      pushNotice("Сейчас недостаточно менто для передачи поддержки.", "warning");
      return;
    }

    const contact = findContactById(state, contactId);
    if (!contact) {
      return;
    }

    setState((current) =>
      prependEvent(
        {
          ...current,
          energies: applyEnergyDelta(current.energies, { mento: -amount }),
          contacts: current.contacts.map((item) =>
            item.id === contactId ? { ...item, support: item.support + amount } : item,
          ),
        },
        createEvent(
          `Передано ${amount} менто контакту «${contact.name}»`,
          "Поддержка усиливает связь наставничества и фиксируется в общей истории.",
          contact.accent,
        ),
      ),
    );

    pushNotice(`Поддержка отправлена контакту «${contact.name}».`, "success");
  }

  function changeGroupMembership(groupId) {
    const boundActiveGoal = state.goals.find(
      (goal) => goal.groupId === groupId && goal.status !== "completed",
    );

    if (boundActiveGoal) {
      pushNotice(
        `Эта группа привязана к цели «${boundActiveGoal.title}». Сначала измени группу в конструкторе или заверши цель.`,
        "warning",
      );
      return;
    }

    const group = findGroupById(state, groupId);
    if (!group) {
      return;
    }

    setState((current) =>
      prependEvent(
        {
          ...current,
          groups: current.groups.map((item) =>
            item.id === groupId ? { ...item, joined: !item.joined } : item,
          ),
        },
        createEvent(
          group.joined ? `Группа «${group.name}» убрана из ленты` : `Группа «${group.name}» добавлена в ленту`,
          group.joined
            ? "Поток материалов стал уже и точнее."
            : "Новый поток контента подключен к рабочему кабинету.",
          SPHERE_META[group.sphere].color,
        ),
      ),
    );
  }

  function openGroup(groupId) {
    setSelectedGroupId(groupId);
    navigate("groups");
  }

  function openFeedForGroup(groupId) {
    setSelectedGroupId(groupId);
    const firstPost = state.posts.find((post) => post.groupId === groupId);
    if (firstPost) {
      setSelectedPostId(firstPost.id);
    }
    navigate("feed");
  }

  function toggleLike(postId) {
    setState((current) => ({
      ...current,
      posts: current.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likedByUser: !post.likedByUser,
              likes: post.likes + (post.likedByUser ? -1 : 1),
            }
          : post,
      ),
    }));
  }

  function savePostToFormer(postId) {
    const post = state.posts.find((item) => item.id === postId);
    if (!post || post.savedToFormer) {
      return;
    }

    setState((current) =>
      prependEvent(
        {
          ...current,
          posts: current.posts.map((item) => (item.id === postId ? { ...item, savedToFormer: true } : item)),
          former: {
            ...current.former,
            sections: {
              ...current.former.sections,
              lifehacks: `${current.former.sections.lifehacks}\n${post.title}: ${post.excerpt}`,
            },
          },
          energies: applyEnergyDelta(current.energies, { informative: 1, intellect: 1 }),
        },
        createEvent(
          `Пост «${post.title}» сохранен в лайфхаки`,
          "Материал можно использовать при следующих постановках целей и во время обзора недели.",
          SPHERE_META[post.sphere].color,
        ),
      ),
    );
  }

  function collectSticker(postId) {
    const post = state.posts.find((item) => item.id === postId);
    if (!post || post.stickerCollected || (post.isSecret && !post.unlocked)) {
      return;
    }

    setState((current) =>
      prependEvent(
        {
          ...current,
          posts: current.posts.map((item) =>
            item.id === postId ? { ...item, stickerCollected: true } : item,
          ),
          energies: applyEnergyDelta(current.energies, {
            informative: 2,
            mento: 1,
          }),
        },
        createEvent(
          `Собран стикер с поста «${post.title}»`,
          "Полезный контент усилил информативность и добавил немного менто.",
          SPHERE_META[post.sphere].color,
        ),
      ),
    );
  }

  function unlockPost(postId) {
    const post = state.posts.find((item) => item.id === postId);
    if (!post || !post.isSecret || post.unlocked) {
      return;
    }

    if (state.energies.mento < 4) {
      pushNotice("Не хватает менто, чтобы открыть скрытый пост.", "warning");
      return;
    }

    setState((current) =>
      prependEvent(
        {
          ...current,
          posts: current.posts.map((item) => (item.id === postId ? { ...item, unlocked: true } : item)),
          energies: applyEnergyDelta(current.energies, { mento: -4 }),
        },
        createEvent(
          `Открыт скрытый пост «${post.title}»`,
          "Менто списано, а материал теперь можно читать, лайкать и сохранять в формер.",
          SPHERE_META[post.sphere].color,
        ),
      ),
    );
  }

  function changePostComposer(field, value) {
    setPostDraft((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function createPost() {
    const group = findGroupById(state, postDraft.groupId);
    if (!group || !group.joined) {
      pushNotice("Сначала подпишись на группу, в которую хочешь публиковать пост.", "warning");
      return;
    }

    if (!postDraft.title.trim() || !postDraft.excerpt.trim()) {
      pushNotice("Заполни заголовок и короткий текст поста.", "warning");
      return;
    }

    const newPost = {
      id: createId("post"),
      groupId: group.id,
      authorName: state.profile.name,
      type: postDraft.type,
      sphere: group.sphere,
      title: postDraft.title.trim(),
      excerpt: postDraft.excerpt.trim(),
      likes: 0,
      views: 1,
      savedToFormer: false,
      likedByUser: false,
      stickerCollected: false,
      isSecret: postDraft.type === "secret",
      unlocked: postDraft.type !== "secret",
    };

    setState((current) =>
      prependEvent(
        {
          ...current,
          posts: [newPost, ...current.posts],
          energies: applyEnergyDelta(current.energies, {
            intellect: -1,
            informative: 2,
          }),
        },
        createEvent(
          `Опубликован новый пост «${newPost.title}»`,
          "Пост появился в ленте выбранной группы и повлиял на общий поток событий.",
          SPHERE_META[newPost.sphere].color,
        ),
      ),
    );

    setSelectedPostId(newPost.id);
    setSelectedGroupId(group.id);
    setPostDraft({
      groupId: group.id,
      type: "guide",
      title: "",
      excerpt: "",
    });
    pushNotice("Пост опубликован и доступен в ленте.", "success");
  }

  function runAbility(action) {
    if (action === "focus") {
      if (activeGoals[0]) {
        setSelectedGoalId(activeGoals[0].id);
      }
      navigate("goals");
      pushNotice("Открыт рабочий фокус недели: сначала следующий выполнимый этап.", "info");
      return;
    }

    if (action === "lingua") {
      if (state.contacts[0]) {
        selectContact(state.contacts[0].id);
      }
      setMessageDraft("Какой следующий фактический шаг ты закроешь до вечера?");
      navigate("contacts");
      pushNotice("Лингвобомба подготовила короткий запрос на честный ответ.", "info");
      return;
    }

    if (action === "boost") {
      setState((current) =>
        prependEvent(
          {
            ...current,
            energies: applyEnergyDelta(current.energies, {
              intellect: 1,
              activity: 2,
              mento: 1,
            }),
          },
          createEvent(
            "Разгон энергии активирован",
            "Небольшой импульс добавлен в энергии, чтобы закрепить движение без перегруза.",
            "#9ce24d",
          ),
        ),
      );
      pushNotice("Энергии немного усилены, можно закрыть ближайший этап.", "success");
      return;
    }

    if (action === "perspective") {
      setSelectedFormerSectionId("swot");
      navigate("former");
      pushNotice("Открыт SWOT-раздел, чтобы перепроверить цель через ограничения и возможности.", "info");
    }
  }

  const headerCards = [
    {
      title: "Горизонт",
      text: state.profile.horizon,
    },
    {
      title: "Фокус недели",
      text: selectedGoal
        ? `${selectedGoal.title}: ${selectedGoal.metric}`
        : "Выбери цель, чтобы увидеть ее ближайший рабочий контур.",
    },
    {
      title: "Следующее напоминание",
      text: nextReminder
        ? `${nextReminder.dayLabel}: ${nextReminder.title}${nextReminder.goalTitle ? ` — ${nextReminder.goalTitle}` : " — личная задача"}`
        : "Ближайшие этапы закрыты, можно создать новую цель или расширить планнер.",
    },
  ];

  const workspaceProps = {
    activeModule,
    state,
    sphereCards,
    semanticWords,
    activeGoals,
    recentEvents: state.events.slice(0, 4),
    formerNavigation,
    formerSections: state.former.sections,
    selectedFormerSectionId,
    formerDraft,
    plannerDays,
    plannerRadius: state.planner.radius,
    allGoals: state.goals,
    selectedGoal,
    constructorStep,
    constructorError,
    draft: goalDraft,
    draftMode,
    contacts: state.contacts,
    visibleContacts,
    selectedContact,
    relatedGoals: relatedGoalsForContact,
    contactQuery,
    messageDraft,
    reminders: plannerDays
      .flatMap((day) =>
        day.tasks
          .filter((task) => task.type === "goal" && !task.done)
          .map((task) => ({ ...task, dayLabel: day.label })),
      )
      .slice(0, 4),
    visiblePosts,
    selectedPost,
    postQuery,
    postDraft,
    joinedGroups,
    groups: state.groups,
    selectedGroup,
    groupPosts,
    relatedGoalsForGroup,
    quickTaskDrafts,
    onCreateGoal: () => openNewGoal(),
    onCreateGoalFromGroup: (groupId) => openNewGoal({ groupId }),
    onAbilityAction: runAbility,
    onOpenGoal: openGoal,
    onSelectSection: setSelectedFormerSectionId,
    onChangeDraft: setFormerDraft,
    onSaveSection: saveFormerSection,
    onSendToConstructor: moveFormerToConstructor,
    onSelectGoal: setSelectedGoalId,
    onCompleteStage: completeStage,
    onToggleQuickTask: toggleQuickTask,
    onAddQuickTask: addQuickTask,
    onChangeQuickTaskDraft: changeQuickTaskDraft,
    onChangeRadius: changePlannerRadius,
    onEditGoal: openEditGoal,
    onOpenGroup: openGroup,
    onSetStep: setConstructorStep,
    onChangeField: changeGoalDraft,
    onChangeStage: changeDraftStage,
    onAddStage: addDraftStage,
    onRemoveStage: removeDraftStage,
    onBack: () => setConstructorStep((current) => clamp(current - 1, 1, 4)),
    onNext: () => setConstructorStep((current) => clamp(current + 1, 1, 4)),
    onSave: saveGoalDraft,
    onChangeContactQuery: setContactQuery,
    onSelectContact: selectContact,
    onChangeMessageDraft: setMessageDraft,
    onSendMessage: sendMessage,
    onTransferMento: transferMento,
    onToggleLike: toggleLike,
    onSavePost: savePostToFormer,
    onCollectSticker: collectSticker,
    onUnlockPost: unlockPost,
    onChangePostQuery: setPostQuery,
    onChangePostDraft: changePostComposer,
    onCreatePost: createPost,
    onSelectPost: setSelectedPostId,
    onOpenFeed: openFeedForGroup,
    onToggleJoin: changeGroupMembership,
    onSelectGroup: setSelectedGroupId,
  };

  const activeModuleMeta = MODULES.find((module) => module.id === activeModule) ?? MODULES[0];

  return (
    <main className="mentorist-page">
      <div className="mentorist-page__glow mentorist-page__glow--left" />
      <div className="mentorist-page__glow mentorist-page__glow--right" />

      <div className="mentorist-app">
        <aside className="command-rail">
          <div className="brand-panel">
            <span className="brand-panel__eyebrow">Рабочий демо-кабинет Mentorist</span>
            <h1>Жизненная стратегия, цели, наставничество и групповая поддержка в одном контуре</h1>
            <p>
              Кабинет устроен так, чтобы личное видение, текущие цели, недельный ритм, полезный контент и общение с наставниками не жили в разных местах.
            </p>
          </div>

          <AppNav activeModule={activeModule} onNavigate={navigate} />

          <section className="rail-panel">
            <div className="panel-head panel-head--compact">
              <div>
                <p className="section-kicker">Энергии</p>
                <h3>Текущий ресурс</h3>
              </div>
              <button className="button button--ghost" onClick={resetDemo} type="button">
                Сбросить демо
              </button>
            </div>
            <div className="energy-stack">
              {Object.entries(state.energies).map(([key, value]) => (
                <article key={key} className="energy-card">
                  <div className="energy-card__head">
                    <span style={{ color: ENERGY_META[key].color }}>{ENERGY_META[key].short}</span>
                    <strong>{value}</strong>
                  </div>
                  <h3>{ENERGY_META[key].label}</h3>
                  <p>{ENERGY_META[key].detail}</p>
                  <div className="meter">
                    <span style={{ width: `${value}%`, background: ENERGY_META[key].color }} />
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rail-panel rail-panel--quote">
            <p className="section-kicker">Фраза на сегодня</p>
            <blockquote>{state.profile.credo}</blockquote>
          </section>
        </aside>

        <section className="stage">
          <header className="hero-panel">
            <div className="hero-panel__copy">
              <span className="hero-chip">{activeModuleMeta.eyebrow}</span>
              <h2>{activeModuleMeta.title}</h2>
              <p>{activeModuleMeta.description}</p>

              <div className="sphere-grid">
                {sphereCards.map((sphere) => (
                  <article key={sphere.id} className="sphere-card">
                    <div className="sphere-card__head">
                      <strong>{sphere.label}</strong>
                      <span>{sphere.score}</span>
                    </div>
                    <div className="meter">
                      <span style={{ width: `${sphere.score}%`, background: sphere.color }} />
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="hero-panel__hub">
              <HeroRing average={averageBalance} />
              <div className="ability-row">
                <span>{activeGoals.length} активные цели</span>
                <span>{joinedGroups.length} группы в ленте</span>
                <span>{unreadMessages} непрочитанных сообщения</span>
              </div>
            </div>

            <div className="hero-panel__aside">
              {headerCards.map((card) => (
                <div key={card.title} className="detail-card">
                  <strong>{card.title}</strong>
                  <p>{card.text}</p>
                </div>
              ))}
            </div>
          </header>

          <section className="workspace">
            <div className="workspace__head">
              <div>
                <span className="section-kicker">Активный контур</span>
                <h3>{activeModuleMeta.label}</h3>
              </div>
              <div className="workspace-pills">
                <span>{state.goals.length} целей в системе</span>
                <span>{state.posts.length} постов в ленте</span>
                <span>{parseLines(state.former.sections.values).length} опорных ценностей</span>
              </div>
            </div>

            {notice?.text ? <div className={`notice notice--${notice.tone}`}>{notice.text}</div> : null}

            <ActiveView {...workspaceProps} />
          </section>
        </section>
      </div>
    </main>
  );
}
