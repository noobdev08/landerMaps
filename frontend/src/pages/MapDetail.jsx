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
  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    getMapById(id)
      .then(res => setMap(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleBuy = async () => {
    if (!termsAccepted) {
      setShowTerms(true);
      return;
    }
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
    <div style={{ minHeight: '100vh', background: '#0d0d0d' }}>
      <Navbar />
      <div style={{ padding: '80px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--pixel)', fontSize: '10px', color: '#7a6a55', animation: 'flicker 2s infinite' }}>
          Loading world...
        </p>
      </div>
    </div>
  );

  if (!map) return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d' }}>
      <Navbar />
      <div style={{ padding: '80px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--pixel)', fontSize: '10px', color: '#e05050', marginBottom: '24px' }}>
          Map not found.
        </p>
        <Link to="/"><PixelBtn variant="brown">← Back</PixelBtn></Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d' }}>
      <Navbar />
      <div style={{ maxWidth: '920px', margin: '0 auto', padding: '48px 28px 80px' }}>

        <Link to="/" style={{ display: 'inline-block', marginBottom: '28px', textDecoration: 'none' }}>
          <PixelBtn variant="brown">← Back to Store</PixelBtn>
        </Link>

        {/* Hero thumbnail */}
        <div style={{
          width: '100%',
          height: '340px',
          background: '#080808',
          border: '2px solid #2a1500',
          boxShadow: '6px 6px 0 rgba(0,0,0,0.8)',
          marginBottom: '32px',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {map.thumbnail ? (
            <img
              src={map.thumbnail}
              alt={map.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', imageRendering: 'pixelated', display: 'block' }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'repeating-linear-gradient(45deg, #0d0d0d 0px, #0d0d0d 8px, #111 8px, #111 16px)',
            }}>
              <span style={{ fontFamily: 'var(--pixel)', fontSize: '10px', color: '#2a2a2a' }}>No Preview</span>
            </div>
          )}
          {/* gradient overlay at bottom */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
            pointerEvents: 'none',
          }} />
        </div>

        {/* Content grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>

          {/* ── Left: details ── */}
          <div>
            {/* Main info card */}
            <div style={{
              background: '#110900',
              border: '2px solid #2a1500',
              boxShadow: '4px 4px 0 rgba(0,0,0,0.7)',
              padding: '24px',
              marginBottom: '20px',
            }}>
              <h1 style={{
                fontFamily: 'var(--pixel)',
                fontSize: '13px',
                color: '#f0d0a0',
                marginBottom: '18px',
                lineHeight: 2,
                textShadow: '2px 2px 0 rgba(0,0,0,0.7)',
                letterSpacing: '1px',
              }}>
                {map.title}
              </h1>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '22px' }}>
                {map.tags?.map(tag => (
                  <span key={tag} style={{
                    fontFamily: 'var(--pixel)', fontSize: '7px',
                    color: '#7a6a55', background: '#1a0e00',
                    border: '1px solid #2a1a08', padding: '4px 10px',
                    letterSpacing: '0.5px',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>

              <div style={{ height: '1px', background: 'linear-gradient(90deg, #3d2007, transparent)', marginBottom: '22px' }} />

              <p style={{
                color: '#b8955a',
                lineHeight: 1.8,
                fontSize: '18px',
                fontFamily: 'var(--vt)',
              }}>
                {map.description}
              </p>
            </div>

            {/* Changelog */}
            {map.changelog && (
              <div style={{
                background: '#110900',
                border: '2px solid #2a1500',
                boxShadow: '4px 4px 0 rgba(0,0,0,0.7)',
                padding: '20px 24px',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px',
                }}>
                  <div style={{ width: '8px', height: '8px', background: '#6aaa30', boxShadow: '0 0 6px #6aaa30' }} />
                  <span style={{ fontFamily: 'var(--pixel)', fontSize: '8px', color: '#7a6a55', letterSpacing: '1px' }}>
                    Changelog
                  </span>
                </div>
                <p style={{ color: '#b8955a', lineHeight: 1.7, fontSize: '17px', fontFamily: 'var(--vt)' }}>
                  {map.changelog}
                </p>
              </div>
            )}
          </div>

          {/* ── Right: buy panel ── */}
          <div style={{
            background: '#110900',
            border: '2px solid #2a1500',
            boxShadow: '4px 4px 0 rgba(0,0,0,0.7)',
            padding: '24px',
            position: 'sticky',
            top: '80px',
          }}>
            {/* Price */}
            <div style={{
              textAlign: 'center',
              padding: '18px 0',
              marginBottom: '20px',
              borderBottom: '2px solid #2a1500',
            }}>
              {map.discount ? (
                <div>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{
                      fontFamily: 'var(--pixel)',
                      fontSize: '12px',
                      color: '#e05050',
                      textShadow: '2px 2px 0 #3d0000',
                      letterSpacing: '1px',
                      fontWeight: 'bold',
                    }}>
                      -{map.discount}% OFF
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <span style={{
                      fontFamily: 'var(--pixel)',
                      fontSize: '16px',
                      color: '#7a6a55',
                      textDecoration: 'line-through',
                      letterSpacing: '1px',
                    }}>
                      €{(map.price / 100).toFixed(2)}
                    </span>
                    <span style={{
                      fontFamily: 'var(--pixel)',
                      fontSize: '24px',
                      color: '#6aaa30',
                      textShadow: '2px 2px 0 #1a4a0f',
                      letterSpacing: '2px',
                    }}>
                      €{((map.price * (100 - map.discount)) / 10000).toFixed(2)}
                    </span>
                  </div>
                </div>
              ) : (
                <span style={{
                  fontFamily: 'var(--pixel)',
                  fontSize: map.price === 0 ? '18px' : '22px',
                  color: map.price === 0 ? '#6aaa30' : '#f0c040',
                  textShadow: map.price === 0 ? '2px 2px 0 #1a4a0f' : '2px 2px 0 #4a3000',
                  letterSpacing: '2px',
                }}>
                  {map.price === 0 ? 'FREE' : `€${(map.price / 100).toFixed(2)}`}
                </span>
              )}
            </div>

            {map.price === 0 ? (
              <PixelBtn variant="green" fullWidth onClick={handleDownload} disabled={downloading}>
                {downloading ? 'Getting link...' : '⬇ Download Free'}
              </PixelBtn>
            ) : (
              <>
                <PixelBtn variant="gold" fullWidth onClick={handleBuy}>
                  Buy Now →
                </PixelBtn>

                <div style={{ borderTop: '2px solid #1a0d00', paddingTop: '20px', marginTop: '20px' }}>
                  <p style={{
                    fontFamily: 'var(--pixel)', fontSize: '7px',
                    color: '#7a6a55', marginBottom: '12px', letterSpacing: '1px',
                  }}>
                    Already purchased?
                  </p>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#0a0600',
                      border: '2px solid #2a1500',
                      color: '#d4b483',
                      fontFamily: 'var(--vt)',
                      fontSize: '16px',
                      padding: '10px 12px',
                      boxSizing: 'border-box',
                      marginBottom: '10px',
                      outline: 'none',
                    }}
                    onFocus={e => e.target.style.borderColor = '#6b3a10'}
                    onBlur={e => e.target.style.borderColor = '#2a1500'}
                  />
                  <PixelBtn variant="brown" fullWidth onClick={handleDownload} disabled={downloading}>
                    {downloading ? 'Checking...' : '⬇ Download'}
                  </PixelBtn>
                </div>
              </>
            )}

            {message && (
              <div style={{
                marginTop: '14px',
                padding: '10px 12px',
                fontFamily: 'var(--pixel)',
                fontSize: '7px',
                letterSpacing: '0.5px',
                background: isError ? 'rgba(74,15,15,0.5)' : 'rgba(26,74,15,0.5)',
                border: `2px solid ${isError ? '#7a1f1f' : '#2d5a10'}`,
                color: isError ? '#e05050' : '#6aaa30',
              }}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>

      {showTerms && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#110900',
            border: '2px solid #2a1500',
            boxShadow: '6px 6px 0 rgba(0,0,0,0.8)',
            padding: '32px 28px',
            maxWidth: '520px',
            maxHeight: '80vh',
            overflow: 'auto',
          }}>
            <h2 style={{
              fontFamily: 'var(--pixel)',
              fontSize: '12px',
              color: '#f0d0a0',
              marginBottom: '16px',
              letterSpacing: '1px',
            }}>
              PURCHASE TERMS
            </h2>

            <div style={{
              background: '#0a0600',
              border: '1px solid #2a1500',
              padding: '16px',
              marginBottom: '20px',
              fontSize: '14px',
              lineHeight: '1.7',
              fontFamily: 'var(--vt)',
              color: '#b8955a',
              maxHeight: '300px',
              overflowY: 'auto',
            }}>
              <p style={{ margin: '0 0 12px' }}>
                I will not share the map with others and will keep this map for personal use only. I will not use it for profit. 
              </p>
              <p style={{ margin: '0' }}>
                You are allowed to make copies of the file to replay the map in its original state.
              </p>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px',
            }}>
              <input
                type="checkbox"
                id="terms-checkbox"
                checked={termsAccepted}
                onChange={e => setTermsAccepted(e.target.checked)}
                style={{
                  cursor: 'pointer',
                  width: '18px',
                  height: '18px',
                }}
              />
              <label
                htmlFor="terms-checkbox"
                style={{
                  fontFamily: 'var(--pixel)',
                  fontSize: '9px',
                  color: '#d4b483',
                  cursor: 'pointer',
                  letterSpacing: '0.5px',
                }}
              >
                I accept the terms above
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <PixelBtn
                variant="brown"
                onClick={() => {
                  setShowTerms(false);
                  setTermsAccepted(false);
                }}
              >
                Cancel
              </PixelBtn>
              <PixelBtn
                variant="gold"
                onClick={handleBuy}
                disabled={!termsAccepted}
              >
                Proceed to Checkout
              </PixelBtn>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', height: '10px' }}>
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} style={{
            flex: 1,
            background: i % 3 === 0 ? '#5c3318' : i % 3 === 1 ? '#4a2810' : '#3d2007',
          }} />
        ))}
      </div>
    </div>
  );
}

function PixelBtn({ variant = 'brown', children, onClick, disabled, fullWidth }) {
  const [hovered, setHovered] = useState(false);
  const variants = {
    brown: { bg: '#3d2007', hover: '#4e2a0a', border: '#6b3a10', color: '#d4b483' },
    green: { bg: '#1a4a0f', hover: '#245e14', border: '#2d7a1a', color: '#6aaa30' },
    gold:  { bg: '#3a2800', hover: '#4e3500', border: '#8a6010', color: '#f0c040' },
    red:   { bg: '#4a0f0f', hover: '#5e1414', border: '#7a1f1f', color: '#e05050' },
  };
  const c = variants[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: 'var(--pixel)',
        fontSize: '8px',
        color: disabled ? '#555' : c.color,
        background: disabled ? '#1a1a1a' : (hovered ? c.hover : c.bg),
        border: `2px solid ${disabled ? '#333' : c.border}`,
        padding: '12px 18px',
        width: fullWidth ? '100%' : 'auto',
        cursor: disabled ? 'not-allowed' : 'pointer',
        letterSpacing: '1px',
        boxShadow: hovered && !disabled ? `2px 3px 0 rgba(0,0,0,0.7)` : `2px 2px 0 rgba(0,0,0,0.6)`,
        transform: hovered && !disabled ? 'translateY(-1px)' : 'none',
        transition: 'all 0.08s',
        display: 'block',
        textAlign: 'center',
      }}
    >
      {children}
    </button>
  );
}