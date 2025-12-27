"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    document.documentElement.style.fontSize = largeText ? "17px" : "16px";
  }, [largeText]);

  useEffect(() => {
    document.body.classList.toggle("contrast-high", highContrast);
  }, [highContrast]);

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      <section className="card p-4">
        <h3 className="font-semibold mb-2">Theme</h3>
        <div className="flex gap-2">
          <button onClick={() => setTheme("light")} className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-ghost border border-[--color-border]'}`}>Light</button>
          <button onClick={() => setTheme("dark")} className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-ghost border border-[--color-border]'}`}>Dark</button>
        </div>
      </section>

      <section className="card p-4">
        <h3 className="font-semibold mb-2">Accessibility</h3>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="font-medium">Large text</p>
            <p className="text-sm text-[--color-muted]">Increase base font size</p>
          </div>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={largeText} onChange={e => setLargeText(e.target.checked)} />
          </label>
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="font-medium">High contrast</p>
            <p className="text-sm text-[--color-muted]">Enhance contrast & saturation</p>
          </div>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={highContrast} onChange={e => setHighContrast(e.target.checked)} />
          </label>
        </div>
      </section>

      <section className="card p-4">
        <h3 className="font-semibold mb-2">Notifications</h3>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="font-medium">Enable notifications</p>
            <p className="text-sm text-[--color-muted]">Receive updates for messages and events (mock)</p>
          </div>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={notifications} onChange={e => setNotifications(e.target.checked)} />
          </label>
        </div>
      </section>

      <section className="card p-4">
        <h3 className="font-semibold mb-2">Profile Customization</h3>
        <div className="grid gap-3">
          <input placeholder="Display name" className="rounded-xl bg-transparent border border-[--color-border] px-3 py-2" />
          <textarea placeholder="Bio" className="rounded-xl bg-transparent border border-[--color-border] px-3 py-2 min-h-24" />
          <button className="btn btn-primary w-fit">Save (mock)</button>
        </div>
      </section>
    </div>
  );
}
