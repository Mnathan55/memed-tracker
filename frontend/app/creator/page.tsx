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
      setMessage('Post submitted');
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
      setMessage(`Views ${data.views.toLocaleString('en-IN')}. Paid now: ${rupees(data.paid)}`);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update views');
    }
  }

  return (
    <div className="box">
      <Header title="Creator dashboard" />

      <h2>Total earnings: {rupees(totalEarnings)}</h2>

      {error && <p className="error">{error}</p>}
      {message && <p className="ok">{message}</p>}

      <h2>Live campaigns</h2>
      {campaigns.length === 0 && <p>No live campaigns right now.</p>}

      {campaigns.map((c) => (
        <div className="card" key={c._id}>
          <h3>
            {c.name} <small>({c.platform})</small>
          </h3>
          <p>
            {c.targets.map((t) => `${t.views.toLocaleString('en-IN')} views → ${rupees(t.payout)}`).join(', ')}
          </p>
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

      <h2>My posts</h2>
      {submissions.length === 0 && <p>You have not submitted any posts.</p>}

      {submissions.map((s) => (
        <div className="card" key={s._id}>
          <p>
            <b>{s.campaign?.name}</b> — <a href={s.postUrl} target="_blank" rel="noreferrer">{s.postUrl}</a>
          </p>
          <p>
            Views {s.views.toLocaleString('en-IN')} | Earned {rupees(s.paidAmount)}
          </p>
          <div className="row">
            <input
              type="number"
              placeholder="Simulate total views"
              value={viewInputs[s._id] || ''}
              onChange={(e) => setViewInputs({ ...viewInputs, [s._id]: e.target.value })}
            />
            <button onClick={() => handleUpdateViews(s._id)}>Update views</button>
          </div>
        </div>
      ))}
    </div>
  );
}