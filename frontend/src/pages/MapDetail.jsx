import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMapById, createCheckout, getDownload } from '../api/api';
import Navbar from '../components/Navbar';

export default function MapDetail() {
  const { id } = useParams();
  const [map, setMap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    getMapById(id)
      .then(res => setMap(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleBuy = async () => {
    try {
      const res = await createCheckout(Number(id));
      window.location.href = res.data.url;
    } catch {
      setIsError(true);
      setMessage('Something went wrong. Try again.');
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    setMessage('');
    try {
      const res = await getDownload(id, email);
      window.open(res.data.downloadUrl, '_blank');
      setIsError(false);
      setMessage('Download started!');
    } catch (err) {
      setIsError(true);
      setMessage(err.response?.data?.message || 'Download failed.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ padding: '80px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--pixel)', fontSize: '10px', color: 'var(--stone)' }}>Loading world...</p>
      </div>
    </div>
  );

  if (!map) return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ padding: '80px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--pixel)', fontSize: '10px', color: 'var(--red)' }}>Map not found.</p>
        <Link to="/"><button className="pixel-btn pixel-btn-brown" style={{ marginTop: '24px' }}>← Back</button></Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 28px' }}>

        <Link to="/" style={{ display: 'inline-block', marginBottom: '24px' }}>
          <button className="pixel-btn pixel-btn-brown" style={{ fontSize: '8px' }}>← Back to Store</button>
        </Link>

        {/* Thumbnail */}
        <div style={{
          width: '100%', height: '320px',
          background: '#080808',
          border: '3px solid var(--mid-brown)',
          boxShadow: '6px 6px 0 rgba(0,0,0,0.7)',
          marginBottom: '28px',
          overflow: 'hidden'
        }}>
          {map.thumbnail ? (
            <img src={map.thumbnail} alt={map.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', imageRendering: 'pixelated', display: 'block' }} />
          ) : (
            <div style={{
              width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'repeating-linear-gradient(45deg, #0d0d0d 0px, #0d0d0d 8px, #111 8px, #111 16px)'
            }}>
              <span style={{ fontFamily: 'var(--pixel)', fontSize: '10px', color: 'var(--dark-stone)' }}>No Preview</span>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>

          {/* Left — details */}
          <div>
            <div className="pixel-card" style={{ marginBottom: '20px' }}>
              <h1 style={{
                fontSize: '13px', color: 'var(--cream)',
                marginBottom: '16px', lineHeight: 2,
                textShadow: '2px 2px 0 rgba(0,0,0,0.6)'
              }}>{map.title}</h1>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
                {map.tags?.map(tag => <span className="tag" key={tag}>{tag}</span>)}
              </div>

              <hr className="pixel-divider" />

              <p style={{ color: 'var(--sand)', lineHeight: 1.7, fontSize: '22px' }}>
                {map.description}
              </p>
            </div>

            {map.changelog && (
              <div className="pixel-card">
                <p style={{
                  fontFamily: 'var(--pixel)', fontSize: '8px',
                  color: 'var(--stone)', marginBottom: '12px',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', background: 'var(--bright-green)' }} />
                  Changelog
                </p>
                <p style={{ color: 'var(--sand)', lineHeight: 1.6, fontSize: '20px' }}>{map.changelog}</p>
              </div>
            )}
          </div>

          {/* Right — buy panel */}
          <div className="pixel-card" style={{ position: 'sticky', top: '24px' }}>
            <div style={{
              textAlign: 'center',
              padding: '16px 0',
              marginBottom: '20px',
              borderBottom: '3px solid var(--mid-brown)'
            }}>
              <span className="price-badge" style={{ fontSize: '16px', padding: '10px 20px' }}>
                {map.price === 0 ? 'FREE' : `€${(map.price / 100).toFixed(2)}`}
              </span>
            </div>

            {map.price === 0 ? (
              <button className="pixel-btn pixel-btn-green" style={{ width: '100%', padding: '16px' }}
                onClick={handleDownload} disabled={downloading}>
                {downloading ? 'Getting link...' : '⬇ Download Free'}
              </button>
            ) : (
              <>
                <button className="pixel-btn pixel-btn-gold" style={{ width: '100%', padding: '16px', marginBottom: '20px' }}
                  onClick={handleBuy}>
                  Buy Now →
                </button>

                <div style={{
                  borderTop: '3px solid var(--dark-brown)',
                  paddingTop: '16px'
                }}>
                  <p style={{
                    fontFamily: 'var(--pixel)', fontSize: '7px',
                    color: 'var(--stone)', marginBottom: '10px'
                  }}>
                    Already purchased?
                  </p>
                  <input
                    className="pixel-input"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ marginBottom: '10px' }}
                  />
                  <button className="pixel-btn pixel-btn-brown" style={{ width: '100%' }}
                    onClick={handleDownload} disabled={downloading}>
                    {downloading ? 'Checking...' : '⬇ Get Download'}
                  </button>
                </div>
              </>
            )}

            {message && (
              <div className={isError ? 'notif-error' : 'notif-success'} style={{ marginTop: '14px' }}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="dirt-bar" style={{ marginTop: '60px' }} />
    </div>
  );
}