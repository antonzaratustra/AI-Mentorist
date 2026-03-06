"use client";

import { useEffect, useRef, useState } from "react";
import MentoristPrototype from "./mentorist-prototype";
import { createSupabaseBrowserClient } from "../lib/supabase/client";

const SYNC_DELAY_MS = 1100;

function getSyncLabel(status) {
  switch (status) {
    case "pending":
      return "Синхронизация…";
    case "saved":
      return "Сохранено в Supabase";
    case "error":
      return "Ошибка синхронизации";
    case "disabled":
      return "Только локальное состояние";
    case "idle":
    default:
      return "Локальный кэш активен";
  }
}

function getSyncTone(status) {
  switch (status) {
    case "saved":
      return "success";
    case "error":
      return "warning";
    case "pending":
      return "accent";
    case "disabled":
      return "info";
    case "idle":
    default:
      return "info";
  }
}

export default function WorkspaceShell({ initialWorkspaceState, syncEnabled, user, userLabel }) {
  const storageKey = `mentorist-demo-state:${user.id}`;
  const syncTimerRef = useRef(null);
  const lastSerializedRef = useRef(initialWorkspaceState ? JSON.stringify(initialWorkspaceState) : "");
  const supabaseRef = useRef(null);
  const [syncStatus, setSyncStatus] = useState(syncEnabled ? "idle" : "disabled");

  if (!supabaseRef.current) {
    supabaseRef.current = createSupabaseBrowserClient();
  }

  useEffect(() => {
    return () => {
      if (syncTimerRef.current) {
        window.clearTimeout(syncTimerRef.current);
      }
    };
  }, []);

  async function flushState(serializedState) {
    if (!syncEnabled || !supabaseRef.current) {
      return;
    }

    const { error } = await supabaseRef.current.from("user_workspace_state").upsert(
      {
        user_id: user.id,
        app_state: JSON.parse(serializedState),
        source: "workspace",
        synced_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    setSyncStatus(error ? "error" : "saved");
  }

  function handleStateChange(nextState) {
    if (!syncEnabled || !supabaseRef.current) {
      return;
    }

    const serializedState = JSON.stringify(nextState);
    if (serializedState === lastSerializedRef.current) {
      return;
    }

    lastSerializedRef.current = serializedState;
    setSyncStatus("pending");

    if (syncTimerRef.current) {
      window.clearTimeout(syncTimerRef.current);
    }

    syncTimerRef.current = window.setTimeout(() => {
      flushState(serializedState);
    }, SYNC_DELAY_MS);
  }

  return (
    <div className="workspace-shell">
      <header className="workspace-shell__head">
        <div>
          <span className="section-kicker">Авторизованный кабинет</span>
          <h1>{userLabel}</h1>
          <p>Состояние кабинета хранится локально для скорости и фоново синхронизируется с Supabase.</p>
        </div>

        <div className="workspace-shell__actions">
          <span className={`status-pill status-pill--${getSyncTone(syncStatus)}`}>{getSyncLabel(syncStatus)}</span>
          <form action="/auth/signout" method="post">
            <button className="button button--ghost" type="submit">
              Выйти
            </button>
          </form>
        </div>
      </header>

      <MentoristPrototype initialState={initialWorkspaceState} onStateChange={handleStateChange} storageKey={storageKey} />
    </div>
  );
}
