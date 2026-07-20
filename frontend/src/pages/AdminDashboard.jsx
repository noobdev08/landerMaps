import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminGetMaps, createMap, updateMap, deleteMap, uploadFile } from '../api/api';
import Navbar from '../components/Navbar.jsx';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
  title: '', description: '', price: '',
  tags: '', changelog: '', published: true,
  fileUrl: '', filePath: '', thumbnail: '', thumbnailPath: '', discount: ''
};

export default function AdminDashboard() {
  const [maps, setMaps] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState('');
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    fetchMaps();
  }, []);

  const fetchMaps = async () => {
    try {
      const res = await adminGetMaps();
      setMaps(res.data);
    } catch {
      logout();
      navigate('/admin/login');
    }
  };


  const handleUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(type);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await uploadFile(formData, type);
      setForm(f => ({
        ...f,
        [type === 'map' ? 'fileUrl' : 'thumbnail']: res.data.url,
        [type === 'map' ? 'filePath' : 'thumbnailPath']: res.data.path
      }));
      setMessage(`${type} uploaded successfully`);
    } catch { setMessage('Upload failed'); }
    finally { setUploading(''); }
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...form,
        price: Number(form.price),
        discount: form.discount ? Number(form.discount) : null,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
      };
      if (editingId) { await updateMap(editingId, data); setMessage('Map updated!'); }
      else { await createMap(data); setMessage('Map created!'); }
      setForm(emptyForm); setEditingId(null); fetchMaps();
    } catch (err) { setMessage(err.response?.data?.message || 'Error saving map'); }
  };

  const handleEdit = (map) => {
    setEditingId(map.id);
    setForm({
      title: map.title, description: map.description, price: map.price,
      tags: map.tags?.join(', ') || '', changelog: map.changelog || '',
      published: map.published, fileUrl: map.fileUrl, filePath: map.filePath || '',
      thumbnail: map.thumbnail, thumbnailPath: map.thumbnailPath || '', discount: map.discount || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this map?')) return;
    try { await deleteMap(id); setMessage('Map deleted'); fetchMaps(); }
    catch { setMessage('Delete failed'); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d' }}>
      <Navbar />
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 28px 80px' }}>

        {/* Page title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px' }}>
          <div style={{ width: '10px', height: '10px', background: editingId ? '#f0c040' : '#6aaa30', boxShadow: editingId ? '0 0 8px #f0c040' : '0 0 8px #6aaa30' }} />
          <h1 style={{ fontFamily: 'var(--pixel)', fontSize: '12px', color: '#f0d0a0', letterSpacing: '2px' }}>
            {editingId ? '[ Edit Map ]' : '[ Create Map ]'}
          </h1>
        </div>

        {/* Form card */}
        <div style={{
          background: '#110900', border: '2px solid #2a1500',
          boxShadow: '4px 4px 0 rgba(0,0,0,0.7)', padding: '28px', marginBottom: '48px',
        }}>
          <Field label="Title" name="title" placeholder="Map title" form={form} setForm={setForm} />
          <Field label="Description" name="description" type="textarea" placeholder="Map description..." form={form} setForm={setForm} />

          {/* Price — show euros */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Price (in cents, 0 = free)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="number"
                placeholder="500"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                style={inputStyle}
              />
              {form.price !== '' && (
                <span style={{ fontFamily: 'var(--pixel)', fontSize: '8px', color: '#f0c040', whiteSpace: 'nowrap' }}>
                  = €{(Number(form.price) / 100).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Discount percentage */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Discount (% off, optional)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="number"
                placeholder="0"
                value={form.discount}
                onChange={e => setForm({ ...form, discount: e.target.value })}
                style={inputStyle}
                min="0"
                max="100"
              />
              {form.discount && form.price && (
                <span style={{ fontFamily: 'var(--pixel)', fontSize: '8px', color: '#6aaa30', whiteSpace: 'nowrap' }}>
                  → €{((Number(form.price) * (100 - Number(form.discount))) / 10000).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <Field label="Tags (comma separated)" name="tags" placeholder="adventure, survival" form={form} setForm={setForm} />
          <Field label="Changelog (optional)" name="changelog" type="textarea" placeholder="What's new..." form={form} setForm={setForm} />

          {/* File uploads — styled */}
          <FileUpload
            label="Thumbnail Image"
            accept="image/*"
            uploading={uploading === 'thumbnail'}
            uploaded={form.thumbnail}
            onChange={e => handleUpload(e, 'thumbnail')}
            hint="PNG, JPG — shown on store listing"
          />
          <FileUpload
            label="Map File (.zip)"
            accept=".zip"
            uploading={uploading === 'map'}
            uploaded={form.fileUrl}
            onChange={e => handleUpload(e, 'map')}
            hint="ZIP archive of the map folder"
          />

          {/* Published toggle */}
          <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              onClick={() => setForm({ ...form, published: !form.published })}
              style={{
                width: '36px', height: '20px',
                background: form.published ? '#2d5a10' : '#2a1500',
                border: `2px solid ${form.published ? '#6aaa30' : '#5a3018'}`,
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.15s',
                flexShrink: 0,
              }}
            >
              <div style={{
                width: '12px', height: '12px',
                background: form.published ? '#6aaa30' : '#5a3018',
                position: 'absolute',
                top: '2px',
                left: form.published ? '18px' : '2px',
                transition: 'left 0.15s',
              }} />
            </div>
            <label
              onClick={() => setForm({ ...form, published: !form.published })}
              style={{ fontFamily: 'var(--pixel)', fontSize: '8px', color: form.published ? '#6aaa30' : '#7a6a55', cursor: 'pointer', letterSpacing: '0.5px' }}
            >
              {form.published ? 'Published — visible to public' : 'Draft — hidden from store'}
            </label>
          </div>

          {message && (
            <div style={{
              fontFamily: 'var(--pixel)', fontSize: '8px',
              color: message.includes('fail') || message.includes('Error') ? '#e05050' : '#6aaa30',
              marginBottom: '20px', letterSpacing: '0.5px',
              padding: '10px', background: 'rgba(0,0,0,0.3)',
              border: `1px solid ${message.includes('fail') ? '#7a1f1f' : '#2d5a10'}`,
            }}>
              {message}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <PixelBtn variant={editingId ? 'gold' : 'green'} onClick={handleSubmit}>
              {editingId ? 'Update Map' : 'Create Map'}
            </PixelBtn>
            {editingId && (
              <PixelBtn variant="brown" onClick={() => { setEditingId(null); setForm(emptyForm); setMessage(''); }}>
                Cancel
              </PixelBtn>
            )}
          </div>
        </div>

        {/* Map list */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <div style={{ width: '8px', height: '8px', background: '#f0c040' }} />
          <h2 style={{ fontFamily: 'var(--pixel)', fontSize: '10px', color: '#b8955a', letterSpacing: '2px' }}>
            [ Your Maps ]
          </h2>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, #3d2007, transparent)' }} />
        </div>

        {maps.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', border: '2px solid #1a0d00' }}>
            <p style={{ fontFamily: 'var(--pixel)', fontSize: '8px', color: '#3d2e1a' }}>No maps yet.</p>
          </div>
        )}

        {maps.map(map => (
          <MapRow key={map.id} map={map} onEdit={handleEdit} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}

function MapRow({ map, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? '#160b00' : '#110900',
        border: `2px solid ${hovered ? '#3d2007' : '#1a0d00'}`,
        boxShadow: '4px 4px 0 rgba(0,0,0,0.6)',
        padding: '16px 20px',
        marginBottom: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'all 0.1s',
      }}
    >
      <div>
        <p style={{ fontFamily: 'var(--pixel)', fontSize: '9px', color: '#f0d0a0', marginBottom: '6px', letterSpacing: '0.5px' }}>
          {map.title}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontFamily: 'var(--pixel)', fontSize: '7px', color: '#b8955a' }}>
            {map.discount ? (
              <>
                <span style={{ textDecoration: 'line-through' }}>€{(map.price / 100).toFixed(2)}</span>
                {' → '}
                <span style={{ color: '#6aaa30' }}>€{((map.price * (100 - map.discount)) / 10000).toFixed(2)}</span>
                <span style={{ color: '#6aaa30', marginLeft: '6px' }}>(-{map.discount}%)</span>
              </>
            ) : (
              `€${(map.price / 100).toFixed(2)}`
            )}
          </span>
          <span style={{ color: '#2a1a08' }}>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{
              display: 'inline-block', width: '6px', height: '6px',
              background: map.published ? '#6aaa30' : '#e05050',
              boxShadow: map.published ? '0 0 4px #6aaa30' : '0 0 4px #e05050',
            }} />
            <span style={{ fontFamily: 'var(--pixel)', fontSize: '7px', color: map.published ? '#6aaa30' : '#e05050' }}>
              {map.published ? 'Live' : 'Hidden'}
            </span>
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <PixelBtn variant="brown" small onClick={() => onEdit(map)}>Edit</PixelBtn>
        <PixelBtn variant="red" small onClick={() => onDelete(map.id)}>Delete</PixelBtn>
      </div>
    </div>
  );
}

function Field({ label, name, form, setForm, type = 'text', placeholder }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={labelStyle}>{label}</label>
      {type === 'textarea' ? (
        <textarea
          rows={4}
          placeholder={placeholder}
          value={form[name]}
          onChange={e => setForm({ ...form, [name]: e.target.value })}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={form[name]}
          onChange={e => setForm({ ...form, [name]: e.target.value })}
          style={inputStyle}
        />
      )}
    </div>
  );
}

function FileUpload({ label, accept, uploading, uploaded, onChange, hint }) {
  const ref = useRef();
  const [hover, setHover] = useState(false);

  // Extract filename from URL
  const filename = uploaded ? uploaded.split('/').pop() : null;

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={labelStyle}>{label}</label>
      {hint && <p style={{ fontFamily: 'var(--vt)', fontSize: '14px', color: '#5a4a35', marginBottom: '8px' }}>{hint}</p>}

      <input ref={ref} type="file" accept={accept} onChange={onChange} style={{ display: 'none' }} />

      <div
        onClick={() => ref.current.click()}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          background: hover ? '#1a0e00' : '#0d0800',
          border: `2px dashed ${uploaded ? '#2d5a10' : hover ? '#6b3a10' : '#2a1500'}`,
          padding: '16px 20px',
          cursor: 'pointer',
          transition: 'all 0.1s',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}
      >
        <span style={{
          fontFamily: 'var(--pixel)', fontSize: '16px',
          color: uploaded ? '#6aaa30' : '#5a4a35',
        }}>
          {uploading ? '⟳' : uploaded ? '✓' : '+'}
        </span>
        <div>
          <p style={{
            fontFamily: 'var(--pixel)', fontSize: '8px', letterSpacing: '0.5px',
            color: uploaded ? '#6aaa30' : hover ? '#d4b483' : '#7a6a55',
          }}>
            {uploading ? 'Uploading...' : uploaded ? filename : 'Choose file'}
          </p>
          {!uploaded && !uploading && (
            <p style={{ fontFamily: 'var(--vt)', fontSize: '13px', color: '#3d2e1a', marginTop: '2px' }}>
              Click to browse
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function PixelBtn({ variant = 'brown', children, onClick, disabled, small }) {
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
        fontSize: small ? '7px' : '8px',
        color: disabled ? '#555' : c.color,
        background: disabled ? '#1a1a1a' : (hovered ? c.hover : c.bg),
        border: `2px solid ${disabled ? '#333' : c.border}`,
        padding: small ? '8px 14px' : '12px 20px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        letterSpacing: '1px',
        boxShadow: hovered && !disabled ? '2px 3px 0 rgba(0,0,0,0.7)' : '2px 2px 0 rgba(0,0,0,0.6)',
        transform: hovered && !disabled ? 'translateY(-1px)' : 'none',
        transition: 'all 0.08s',
      }}
    >
      {children}
    </button>
  );
}

const labelStyle = {
  fontFamily: 'var(--pixel)',
  fontSize: '8px',
  color: '#7a6a55',
  display: 'block',
  marginBottom: '8px',
  letterSpacing: '0.5px',
};

const inputStyle = {
  width: '100%',
  background: '#0a0600',
  border: '2px solid #2a1500',
  color: '#d4b483',
  fontFamily: 'var(--vt)',
  fontSize: '17px',
  padding: '10px 14px',
  boxSizing: 'border-box',
  outline: 'none',
  transition: 'border-color 0.1s',
};