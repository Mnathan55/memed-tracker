'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { api, getUser, rupees, BrandCampaign } from '@/lib/api';

interface Row {
  views: string;
  payout: string;
}

export default function BrandPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<BrandCampaign[]>([]);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [totalBudget, setTotalBudget] = useState('');
  const [rows, setRows] = useState<Row[]>([{ views: '', payout: '' }]);

  const load = useCallback(async () => {
    try {
      setCampaigns(await api<BrandCampaign[]>('/api/campaigns/mine'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load campaigns');
    }
  }, []);

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== 'brand') {
      router.replace('/login');
      return;
    }
    load();
  }, [router, load]);

  function changeRow(index: number, field: keyof Row, value: string) {
    setRows(rows.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    try {
      await api('/api/campaigns', {
        method: 'POST',
        body: {
          name,
          platform,
          totalBudget: Number(totalBudget),
          targets: rows.map((r) => ({ views: Number(r.views), payout: Number(r.payout) })),
        },
      });

      setName('');
      setTotalBudget('');
      setRows([{ views: '', payout: '' }]);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create campaign');
    }
  }

  return (
    <div className="box">
      <Header title="Brand dashboard" />

      <h2>Create a campaign</h2>
      <form onSubmit={handleCreate}>
        <input placeholder="Campaign name" value={name} onChange={(e) => setName(e.target.value)} required />

        <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
          <option value="instagram">Instagram</option>
          <option value="youtube">YouTube</option>
        </select>

        <input
          type="number"
          placeholder="Total budget (₹)"
          value={totalBudget}
          onChange={(e) => setTotalBudget(e.target.value)}
          required
        />

        <p>Targets (views reached, money paid)</p>
        {rows.map((row, i) => (
          <div className="row" key={i}>
            <input
              type="number"
              placeholder="Views e.g. 10000"
              value={row.views}
              onChange={(e) => changeRow(i, 'views', e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Payout e.g. 500"
              value={row.payout}
              onChange={(e) => changeRow(i, 'payout', e.target.value)}
              required
            />
            {rows.length > 1 && (
              <button type="button" onClick={() => setRows(rows.filter((_, n) => n !== i))}>
                X
              </button>
            )}
          </div>
        ))}

        <button type="button" onClick={() => setRows([...rows, { views: '', payout: '' }])}>
          + Add target
        </button>

        {error && <p className="error">{error}</p>}
        <button type="submit">Create campaign</button>
      </form>

      <h2>Your campaigns</h2>
      {campaigns.length === 0 && <p>No campaigns yet.</p>}

      {campaigns.map((c) => {
        const percent = Math.min(100, (c.spent / c.totalBudget) * 100);
        return (
          <div className="card" key={c.id}>
            <h3>
              {c.name} <small>({c.platform}, {c.status})</small>
            </h3>
            <div className="bar">
              <div className="fill" style={{ width: `${percent}%` }} />
            </div>
            <p>
              Budget {rupees(c.totalBudget)} | Spent {rupees(c.spent)} | Remaining {rupees(c.remaining)}
            </p>
            <p>
              Targets:{' '}
              {c.targets.map((t) => `${t.views.toLocaleString('en-IN')} views → ${rupees(t.payout)}`).join(', ')}
            </p>
          </div>
        );
      })}
    </div>
  );
}