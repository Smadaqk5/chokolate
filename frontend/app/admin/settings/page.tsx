"use client";

import { useEffect, useState } from "react";
import { api, BusinessSettings } from "@/lib/api";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getSettings().then(setSettings).catch(console.error);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    await api.updateSettings(settings as Parameters<typeof api.updateSettings>[0]);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!settings) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold mb-8">Business Settings</h1>
      <form onSubmit={handleSave} className="card p-6 max-w-2xl space-y-4">
        {saved && <p className="text-green-600 text-sm">Settings saved!</p>}
        {(["business_name", "email", "phone", "whatsapp", "mpesa_till_number", "currency"] as const).map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium mb-1 capitalize">{field.replace(/_/g, " ")}</label>
            <input className="input" value={String(settings[field] || "")} onChange={(e) => setSettings({ ...settings, [field]: e.target.value })} />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium mb-1">Delivery Charge</label>
          <input type="number" className="input" value={Number(settings.delivery_charge) || 0} onChange={(e) => setSettings({ ...settings, delivery_charge: Number(e.target.value) })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Pickup Location</label>
          <textarea className="input" rows={2} value={String(settings.pickup_location || "")} onChange={(e) => setSettings({ ...settings, pickup_location: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Business Hours</label>
          <textarea className="input" rows={4} value={String(settings.business_hours || "")} onChange={(e) => setSettings({ ...settings, business_hours: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <textarea className="input" rows={2} value={String(settings.address || "")} onChange={(e) => setSettings({ ...settings, address: e.target.value })} />
        </div>
        <button type="submit" className="btn-primary">Save Settings</button>
      </form>
    </div>
  );
}
