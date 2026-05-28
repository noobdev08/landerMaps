import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMaps } from '../api/api';
import Navbar from '../components/Navbar';

export default function Home() {
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMaps()
      .then(res => setMaps(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #0d0d0d)' }}>
      <Navbar />

      {/* ── Hero ── */}
      <div style={{
        textAlign: 'center',
        padding: '90px 24px 50px',
        position: 'relative',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, #1c1200 0%, #0d0d0d 70%)',
      }}>
        {/* Subtle grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.015,
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

        <p style={{
          fontFamily: 'var(--pixel)',
          fontSize: '9px',
          color: '#7a6a55',
          letterSpacing: '5px',
          marginBottom: '22px',
          textTransform: 'uppercase',
          position: 'relative',
        }}>
          ✦ Welcome to ✦
        </p>

        <h1 style={{
          fontFamily: 'var(--pixel)',
          fontSize: 'clamp(22px, 5vw, 40px)',
          color: 'var(--bright-green)',
          textShadow: '4px 4px 0 #1a4a0f, 7px 7px 0 rgba(0,0,0,0.5)',
          marginBottom: '24px',
          lineHeight: 1.8,
          animation: 'flicker 10s infinite',
          position: 'relative',
        }}>
          Map_Buildz
        </h1>

        <p style={{
          fontFamily: 'var(--vt)',
          fontSize: '22px',
          color: '#b8955a',
          maxWidth: '440px',
          margin: '0 auto 44px',
          lineHeight: 1.6,
          position: 'relative',
        }}>
          Hand-crafted Minecraft maps, built different.
        </p>

        {/* Feature pills */}
        <div style={{
          display: 'flex', gap: '10px', justifyContent: 'center',
          flexWrap: 'wrap', paddingBottom: '20px', position: 'relative',
        }}>
          {[
            { icon: '⚔', label: 'Adventure', color: 'var(--bright-green)', border: '#2d5a10', bg: 'rgba(45,90,16,0.2)' },
            { icon: '🏰', label: 'Custom Builds', color: '#b8955a', border: '#5c3318', bg: 'rgba(92,51,24,0.25)' },
            { icon: '★', label: 'Premium Quality', color: '#f0c040', border: '#8a6010', bg: 'rgba(138,96,16,0.2)' },
          ].map(p => (
            <span key={p.label} style={{
              fontFamily: 'var(--pixel)',
              fontSize: '8px',
              color: p.color,
              padding: '8px 14px',
              border: `2px solid ${p.border}`,
              background: p.bg,
              letterSpacing: '1px',
              boxShadow: '2px 2px 0 rgba(0,0,0,0.4)',
            }}>
              {p.icon} {p.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Map Grid ── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '56px 28px 80px' }}>

        {/* Section header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '36px',
        }}>
          <div style={{ width: '10px', height: '10px', background: 'var(--bright-green)', boxShadow: '0 0 8px #6aaa30' }} />
          <span style={{
            fontFamily: 'var(--pixel)', fontSize: '10px', color: 'var(--cream)',
            letterSpacing: '2px',
          }}>
            Available Maps {maps.length > 0 && `(${maps.length})`}
          </span>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, #3d2007, transparent)' }} />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px' }}>
            <p style={{ fontFamily: 'var(--pixel)', fontSize: '10px', color: '#7a6a55', animation: 'flicker 2s infinite' }}>
              Loading world...
            </p>
          </div>
        ) : maps.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px',
            border: '2px solid #2a1500', background: '#0f0800',
          }}>
            <p style={{ fontFamily: 'var(--pixel)', fontSize: '10px', color: '#7a6a55' }}>
              No maps yet. Check back soon.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px',
          }}>
            {maps.map((map, i) => (
              <MapCard key={map.id} map={map} delay={i * 0.07} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', height: '10px' }}>
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} style={{
            flex: 1,
            background: i % 3 === 0 ? '#5c3318' : i % 3 === 1 ? '#4a2810' : '#3d2007',
          }} />
        ))}
      </div>
      <div style={{
        background: '#080400',
        padding: '28px',
        textAlign: 'center',
        fontFamily: 'var(--pixel)',
        fontSize: '7px',
        color: '#3d2e1a',
        letterSpacing: '2px',
      }}>
        MAP_BUILDZ © 2025 — MADE WITH ❤ BY NOOBDEV
      </div>
    </div>
  );
}

function MapCard({ map, delay }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link to={`/maps/${map.id}`} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: '#110900',
          border: `2px solid ${hovered ? '#6b3a10' : '#2a1500'}`,
          boxShadow: hovered
            ? '0 0 0 1px #3d2007, 6px 6px 0 rgba(0,0,0,0.8), 0 0 20px rgba(107,58,16,0.15)'
            : '4px 4px 0 rgba(0,0,0,0.7)',
          transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
          transition: 'all 0.12s ease',
          cursor: 'pointer',
          animationDelay: `${delay}s`,
          overflow: 'hidden',
        }}
      >
        {/* Thumbnail */}
        <div style={{
          width: '100%', height: '190px',
          background: '#080808',
          overflow: 'hidden',
          position: 'relative',
          borderBottom: `2px solid ${hovered ? '#6b3a10' : '#1a0d00'}`,
        }}>
          {map.thumbnail ? (
            <img
              src={map.thumbnail}
              alt={map.title}
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover',
                imageRendering: 'pixelated',
                display: 'block',
                transform: hovered ? 'scale(1.04)' : 'scale(1)',
                transition: 'transform 0.2s ease',
              }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'repeating-linear-gradient(45deg, #0d0d0d 0px, #0d0d0d 8px, #111 8px, #111 16px)',
            }}>
              <span style={{ fontFamily: 'var(--pixel)', fontSize: '8px', color: '#2a2a2a' }}>No Preview</span>
            </div>
          )}

          {/* Price badge */}
          <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
            {map.discount ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                <span style={{
                  fontFamily: 'var(--pixel)',
                  fontSize: '10px',
                  color: '#e05050',
                  background: 'rgba(74,15,15,0.95)',
                  border: '2px solid #7a1f1f',
                  padding: '4px 8px',
                  boxShadow: '2px 2px 0 rgba(0,0,0,0.6)',
                  letterSpacing: '1px',
                  fontWeight: 'bold',
                }}>
                  -{map.discount}%
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-end' }}>
                  <span style={{
                    fontFamily: 'var(--pixel)',
                    fontSize: '7px',
                    color: '#7a6a55',
                    textDecoration: 'line-through',
                    letterSpacing: '0.5px',
                  }}>
                    €{(map.price / 100).toFixed(2)}
                  </span>
                  <span style={{
                    fontFamily: 'var(--pixel)',
                    fontSize: '9px',
                    color: '#6aaa30',
                    background: 'rgba(10,30,5,0.95)',
                    border: '2px solid #2d5a10',
                    padding: '4px 10px',
                    boxShadow: '2px 2px 0 rgba(0,0,0,0.6)',
                    letterSpacing: '1px',
                  }}>
                    €{((map.price * (100 - map.discount)) / 10000).toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              <span style={{
                fontFamily: 'var(--pixel)',
                fontSize: '9px',
                color: map.price === 0 ? '#6aaa30' : '#f0c040',
                background: map.price === 0 ? 'rgba(10,30,5,0.95)' : 'rgba(20,15,0,0.95)',
                border: `2px solid ${map.price === 0 ? '#2d5a10' : '#8a6010'}`,
                padding: '4px 10px',
                boxShadow: '2px 2px 0 rgba(0,0,0,0.6)',
                letterSpacing: '1px',
              }}>
                {map.price === 0 ? 'FREE' : `€${(map.price / 100).toFixed(2)}`}
              </span>
            )}
          </div>

          {/* Hover overlay */}
          {hovered && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, transparent 50%, rgba(107,58,16,0.15) 100%)',
              pointerEvents: 'none',
            }} />
          )}
        </div>

        {/* Card body */}
        <div style={{ padding: '16px 18px 12px' }}>
          <h3 style={{
            fontFamily: 'var(--pixel)',
            fontSize: '9px',
            color: hovered ? '#f0d0a0' : 'var(--cream)',
            marginBottom: '12px',
            lineHeight: 1.9,
            letterSpacing: '0.5px',
            transition: 'color 0.12s',
          }}>
            {map.title}
          </h3>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {map.tags?.slice(0, 3).map(tag => (
              <span key={tag} style={{
                fontFamily: 'var(--pixel)',
                fontSize: '7px',
                color: '#7a6a55',
                background: '#1a0e00',
                border: '1px solid #2a1a08',
                padding: '3px 8px',
                letterSpacing: '0.5px',
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          padding: '10px 18px',
          borderTop: `1px solid #1a0d00`,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{
            fontFamily: 'var(--pixel)', fontSize: '7px',
            color: hovered ? '#6aaa30' : '#5a4a35',
            transition: 'color 0.12s',
          }}>
            View Map →
          </span>
          <span style={{ fontFamily: 'var(--pixel)', fontSize: '7px', color: '#3d2e1a' }}>
            Map_Buildz
          </span>
        </div>
      </div>
    </Link>
  );
}