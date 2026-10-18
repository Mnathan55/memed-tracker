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

  // totals for the top tiles
  const budgetSum = campaigns.reduce((sum, c) => sum + c.totalBudget, 0);
  const spentSum = campaigns.reduce((sum, c) => sum + c.spent, 0);

  return (
    <div className="wrap">
      <Header />

      <h1>Brand dashboard 📈</h1>
      <p className="muted" style={{ marginBottom: 18 }}>Launch campaigns and watch the budget move.</p>

      <div className="stats">
        <div className="stat" style={{ background: 'var(--yellow)' }}>
          <small>Total budget</small>
          <b>{rupees(budgetSum)}</b>
        </div>
        <div className="stat" style={{ background: 'var(--pink)' }}>
          <small>Paid out</small>
          <b>{rupees(spentSum)}</b>
        </div>
        <div className="stat" style={{ background: 'var(--green)' }}>
          <small>Remaining</small>
          <b>{rupees(budgetSum - spentSum)}</b>
        </div>
      </div>

      <div className="card">
        <h2>New campaign 🚀</h2>
        <form onSubmit={handleCreate}>
          <input placeholder="Campaign name" value={name} onChange={(e) => setName(e.target.value)} required />

          <div className="row">
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
          </div>

          <label>Payout targets: views reached → money paid</label>
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
                <button
                  type="button"
                  className="btn-pink btn-small"
                  onClick={() => setRows(rows.filter((_, n) => n !== i))}
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <div className="row">
            <button type="button" className="btn-yellow" onClick={() => setRows([...rows, { views: '', payout: '' }])}>
              + Add target
            </button>
            <button type="submit">Create campaign</button>
          </div>

          {error && <p className="error">{error}</p>}
        </form>
      </div>

      <h2>Your campaigns</h2>
      {campaigns.length === 0 && <div className="card">No campaigns yet. Create your first one above 👆</div>}

      {campaigns.map((c) => {
        const percent = Math.min(100, (c.spent / c.totalBudget) * 100);
        return (
          <div className="card" key={c.id}>
            <div className="spread">
              <h3>{c.name}</h3>
              <div className="row">
                <span className={`pill ${c.platform === 'instagram' ? 'pill-pink' : 'pill-orange'}`}>{c.platform}</span>
                <span className={`pill ${c.status === 'live' ? 'pill-green' : 'pill-yellow'}`}>{c.status}</span>
              </div>
            </div>

            <div className="bar">
              <div className="fill" style={{ width: `${percent}%` }} />
            </div>

            <div className="spread">
              <span><b>{rupees(c.spent)}</b> spent ({percent.toFixed(0)}%)</span>
              <span><b>{rupees(c.remaining)}</b> left of {rupees(c.totalBudget)}</span>
            </div>

            <div className="chips">
              {c.targets.map((t) => (
                <span className="chip" key={t.views}>
                  {t.views.toLocaleString('en-IN')} views → {rupees(t.payout)}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}