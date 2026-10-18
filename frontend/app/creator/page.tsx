'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { api, getUser, rupees, LiveCampaign, MySubmission } from '@/lib/api';

interface EarningsReply {
  totalEarnings: number;
  submissions: MySubmission[];
}

interface ViewsReply {
  views: number;
  paid: number;
  totalPaid: number;
}

export default function CreatorPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<LiveCampaign[]>([]);
  const [submissions, setSubmissions] = useState<MySubmission[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [links, setLinks] = useState<Record<string, string>>({});
  const [viewInputs, setViewInputs] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    try {
      setCampaigns(await api<LiveCampaign[]>('/api/campaigns'));
      const mine = await api<EarningsReply>('/api/submissions/mine');
      setSubmissions(mine.submissions);
      setTotalEarnings(mine.totalEarnings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load data');
    }
  }, []);

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== 'creator') {
      router.replace('/login');
      return;
    }
    load();
  }, [router, load]);

  async function handleSubmitPost(campaignId: string) {
    setError('');
    setMessage('');

    try {
      await api(`/api/campaigns/${campaignId}/submissions`, {
        method: 'POST',
        body: { postUrl: links[campaignId] || '' },
      });
      setLinks({ ...links, [campaignId]: '' });
      setMessage('Post submitted 🎉');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit');
    }
  }

  // calls the same endpoint the platform would call
  async function handleUpdateViews(submissionId: string) {
    setError('');
    setMessage('');

    try {
      const data = await api<ViewsReply>(`/api/submissions/${submissionId}/views`, {
        method: 'PATCH',
        body: { views: Number(viewInputs[submissionId]) },
      });
      setMessage(`Views now ${data.views.toLocaleString('en-IN')}. Paid this time: ${rupees(data.paid)} 💸`);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update views');
    }
  }

  return (
    <div className="wrap">
      <Header />

      <h1>Creator dashboard 🔥</h1>
      <p className="muted" style={{ marginBottom: 18 }}>Pick a campaign, post, and watch the money land.</p>

      <div className="stats">
        <div className="stat" style={{ background: 'var(--green)' }}>
          <small>Total earnings</small>
          <b>{rupees(totalEarnings)}</b>
        </div>
        <div className="stat" style={{ background: 'var(--purple)', color: '#fff' }}>
          <small>Posts submitted</small>
          <b>{submissions.length}</b>
        </div>
        <div className="stat" style={{ background: 'var(--yellow)' }}>
          <small>Live campaigns</small>
          <b>{campaigns.length}</b>
        </div>
      </div>

      {error && <p className="error" style={{ marginBottom: 14 }}>{error}</p>}
      {message && <p className="ok" style={{ marginBottom: 14 }}>{message}</p>}

      <h2>Live campaigns</h2>
      {campaigns.length === 0 && <div className="card">No live campaigns right now. Check back soon 👀</div>}

      {campaigns.map((c) => (
        <div className="card" key={c._id}>
          <div className="spread">
            <h3>{c.name}</h3>
            <span className={`pill ${c.platform === 'instagram' ? 'pill-pink' : 'pill-orange'}`}>{c.platform}</span>
          </div>

          <div className="chips" style={{ marginBottom: 12 }}>
            {c.targets.map((t) => (
              <span className="chip" key={t.views}>
                {t.views.toLocaleString('en-IN')} views → {rupees(t.payout)}
              </span>
            ))}
          </div>

          <div className="row">
            <input
              placeholder={`Paste your ${c.platform} post link`}
              value={links[c._id] || ''}
              onChange={(e) => setLinks({ ...links, [c._id]: e.target.value })}
            />
            <button onClick={() => handleSubmitPost(c._id)}>Submit</button>
          </div>
        </div>
      ))}

      <h2 style={{ marginTop: 28 }}>My posts</h2>
      {submissions.length === 0 && <div className="card">No posts yet. Submit a link above 👆</div>}

      {submissions.map((s) => (
        <div className="card" key={s._id}>
          <div className="spread">
            <h3>{s.campaign?.name}</h3>
            <span className="pill pill-green">Earned {rupees(s.paidAmount)}</span>
          </div>

          <p>
            <a href={s.postUrl} target="_blank" rel="noreferrer">{s.postUrl}</a>
          </p>
          <p><b>{s.views.toLocaleString('en-IN')}</b> views</p>

          <div className="row" style={{ marginTop: 10 }}>
            <input
              type="number"
              placeholder="Simulate total views"
              value={viewInputs[s._id] || ''}
              onChange={(e) => setViewInputs({ ...viewInputs, [s._id]: e.target.value })}
            />
            <button className="btn-purple" onClick={() => handleUpdateViews(s._id)}>
              Update views
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}