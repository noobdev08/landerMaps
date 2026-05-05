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
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <div style={{
        textAlign: 'center',
        padding: '80px 24px 60px',
        background: 'linear-gradient(180deg, #050810 0%, #0d0d0d 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative pixel blocks */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          display: 'flex', justifyContent: 'center', gap: '0px'
        }}>
          {['#5a8a2f','#4a7a1f','#6aaa30','#3d6618','#5a8a2f','#4a7a1f','#6aaa30','#3d6618',
            '#5a8a2f','#4a7a1f','#6aaa30','#3d6618','#5a8a2f','#4a7a1f','#6aaa30','#3d6618'].map((c, i) => (
            <div key={i} style={{ width: '64px', height: '24px', background: c, flexShrink: 0 }} />
          ))}
        </div>

        <p style={{
          fontFamily: 'var(--pixel)',
          fontSize: '10px',
          color: 'var(--stone)',
          letterSpacing: '4px',
          marginBottom: '20px',
          textTransform: 'uppercase'
        }}>
          Welcome to
        </p>

        <h1 style={{
          fontFamily: 'var(--pixel)',
          fontSize: 'clamp(18px, 4vw, 32px)',
          color: 'var(--bright-green)',
          textShadow: '4px 4px 0 var(--dark-green), 6px 6px 0 rgba(0,0,0,0.5)',
          marginBottom: '20px',
          lineHeight: 2,
          animation: 'flicker 10s infinite'
        }}>
          Map_Buildz
        </h1>

        <p style={{
          fontFamily: 'var(--vt)',
          fontSize: '28px',
          color: 'var(--sand)',
          maxWidth: '500px',
          margin: '0 auto 40px',
          lineHeight: 1.5
        }}>
          High Quality and-crafted minecraft maps 
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', paddingBottom: '32px' }}>
          <span style={{
            fontFamily: 'var(--pixel)', fontSize: '8px',
            color: 'var(--bright-green)', padding: '6px 12px',
            border: '2px solid var(--green)', background: 'rgba(90,138,47,0.15)'
          }}>⚔ Adventure</span>
          <span style={{
            fontFamily: 'var(--pixel)', fontSize: '8px',
            color: 'var(--sand)', padding: '6px 12px',
            border: '2px solid var(--mid-brown)', background: 'rgba(92,51,24,0.3)'
          }}>🏰 Custom Builds</span>
          <span style={{
            fontFamily: 'var(--pixel)', fontSize: '8px',
            color: 'var(--gold)', padding: '6px 12px',
            border: '2px solid var(--dark-gold)', background: 'rgba(184,134,11,0.15)'
          }}>★ Premium Quality</span>
        </div>
      </div>

      {/* Map Grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 28px' }}>
        <div className="section-header">
          Available Maps {maps.length > 0 && `(${maps.length})`}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ fontFamily: 'var(--pixel)', fontSize: '10px', color: 'var(--stone)' }}>
              Loading world...
            </p>
          </div>
        ) : maps.length === 0 ? (
          <div className="pixel-card" style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ fontFamily: 'var(--pixel)', fontSize: '10px', color: 'var(--stone)' }}>
              No maps yet. Check back soon.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '28px'
          }}>
            {maps.map((map, i) => (
              <Link to={`/maps/${map.id}`} key={map.id}>
                <div className="map-card fade-up" style={{ animationDelay: `${i * 0.07}s` }}>
                  {/* Thumbnail */}
                  <div style={{
                    width: '100%', height: '180px',
                    background: '#080808',
                    overflow: 'hidden',
                    position: 'relative',
                    borderBottom: '3px solid var(--mid-brown)'
                  }}>
                    {map.thumbnail ? (
                      <img src={map.thumbnail} alt={map.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', imageRendering: 'pixelated', display: 'block' }} />
                    ) : (
                      <div style={{
                        width: '100%', height: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'repeating-linear-gradient(45deg, #0d0d0d 0px, #0d0d0d 8px, #111 8px, #111 16px)'
                      }}>
                        <span style={{ fontFamily: 'var(--pixel)', fontSize: '8px', color: 'var(--dark-stone)' }}>
                          No Preview
                        </span>
                      </div>
                    )}
                    {/* Price overlay */}
                    <div style={{
                      position: 'absolute', top: '10px', right: '10px'
                    }}>
                      <span className="price-badge">
                        {map.price === 0 ? 'FREE' : `€${(map.price / 100).toFixed(2)}`}
                      </span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div style={{ padding: '16px' }}>
                    <h3 style={{
                      fontFamily: 'var(--pixel)',
                      fontSize: '9px',
                      color: 'var(--cream)',
                      marginBottom: '10px',
                      lineHeight: 1.8,
                      textShadow: '1px 1px 0 rgba(0,0,0,0.5)'
                    }}>{map.title}</h3>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {map.tags?.slice(0, 3).map(tag => (
                        <span className="tag" key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom bar */}
                  <div style={{
                    padding: '10px 16px',
                    borderTop: '2px solid var(--dark-brown)',
                    background: 'rgba(0,0,0,0.3)',
                    fontFamily: 'var(--pixel)',
                    fontSize: '7px',
                    color: 'var(--stone)',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>View Map →</span>
                    <span>lanplayer345</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="dirt-bar" />
      <div style={{
        background: '#0a0500',
        padding: '24px',
        textAlign: 'center',
        fontFamily: 'var(--pixel)',
        fontSize: '7px',
        color: 'var(--dark-stone)'
      }}>
        Map_Buildz © 2025 — Made by NoobDev
      </div>
    </div>
  );
}