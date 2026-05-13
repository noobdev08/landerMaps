import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminGetMaps, createMap, updateMap, deleteMap, uploadFile } from '../api/api';
import Navbar from '../components/Navbar.jsx';

const emptyForm = {
    title: '', description: '', price: '',
    tags: '', changelog: '', published: true,
    fileUrl: '', filePath: '', thumbnail: '', thumbnailPath: ''
};

const Field = ({ label, name, form, setForm, type = 'text', placeholder }) => (
    <div style={{ marginBottom: '16px', position: 'relative', zIndex: 2 }}>
        <label style={{ fontFamily: 'var(--pixel)', fontSize: '8px', color: 'var(--stone)', display: 'block', marginBottom: '8px' }}>
            {label}
        </label>
        {type === 'textarea' ? (
            <textarea
                className="pixel-input"
                rows={4}
                placeholder={placeholder}
                value={form[name]}
                onChange={e => setForm({ ...form, [name]: e.target.value })}
                style={{ resize: 'vertical', position: 'relative', zIndex: 2 }}
            />
        ) : (
            <input
                className="pixel-input"
                type={type}
                placeholder={placeholder}
                value={form[name]}
                onChange={e => setForm({ ...form, [name]: e.target.value })}
                style={{ position: 'relative', zIndex: 2 }}
            />
        )}
    </div>
);

export default function AdminDashboard() {
    const [maps, setMaps] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState('');
    const [uploading, setUploading] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/admin/login');
            return;
        }

        fetchMaps();
    }, []);

    const fetchMaps = async () => {
        try {
            const res = await adminGetMaps();
            setMaps(res.data);
        } catch {
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
        } catch {
            setMessage('Upload failed');
        } finally {
            setUploading('');
        }
    };

    const handleSubmit = async () => {
        try {
            const data = {
                ...form,
                price: Number(form.price),
                tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
            };
            if (editingId) {
                await updateMap(editingId, data);
                setMessage('Map updated!');
            } else {
                await createMap(data);
                setMessage('Map created!');
            }
            setForm(emptyForm);
            setEditingId(null);
            fetchMaps();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Error saving map');
        }
    };

    const handleEdit = (map) => {
        setEditingId(map.id);
        setForm({
            title: map.title,
            description: map.description,
            price: map.price,
            tags: map.tags?.join(', ') || '',
            changelog: map.changelog || '',
            published: map.published,
            fileUrl: map.fileUrl,
            filePath: map.filePath || '',
            thumbnail: map.thumbnail,
            thumbnailPath: map.thumbnailPath || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this map?')) return;
        try {
            await deleteMap(id);
            setMessage('Map deleted');
            fetchMaps();
        } catch {
            setMessage('Delete failed');
        }
    };

    return (
        <div style={{ minHeight: '100vh' }}>
            <Navbar />
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>

                <h1 style={{ fontSize: '14px', color: 'var(--cream)', marginBottom: '32px' }}>
                    {editingId ? '[ Edit Map ]' : '[ Create Map ]'}
                </h1>

                <div className="pixel-card" style={{ marginBottom: '40px' }}>
                    <Field label="Title" name="title" placeholder="Map title" form={form} setForm={setForm} />
                    <Field label="Description" name="description" type="textarea" placeholder="Map description..." form={form} setForm={setForm} />
                    <Field label="Price (in cents, 0 = free)" name="price" type="number" placeholder="500" form={form} setForm={setForm} />
                    <Field label="Tags (comma separated)" name="tags" placeholder="adventure, survival" form={form} setForm={setForm} />
                    <Field label="Changelog (optional)" name="changelog" type="textarea" placeholder="What's new..." form={form} setForm={setForm} />

                    {/* Thumbnail Upload */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ fontFamily: 'var(--pixel)', fontSize: '8px', color: 'var(--stone)', display: 'block', marginBottom: '8px' }}>
                            Thumbnail Image
                        </label>
                        <input type="file" accept="image/*" onChange={e => handleUpload(e, 'thumbnail')}
                            style={{ color: 'var(--cream)', fontFamily: 'var(--vt)' }} />
                        {uploading === 'thumbnail' && <p style={{ fontFamily: 'var(--pixel)', fontSize: '8px', color: 'var(--stone)', marginTop: '4px' }}>Uploading...</p>}
                        {form.thumbnail && <p style={{ fontFamily: 'var(--pixel)', fontSize: '8px', color: 'var(--green)', marginTop: '4px' }}>✓ {form.thumbnail}</p>}
                    </div>

                    {/* Map File Upload */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ fontFamily: 'var(--pixel)', fontSize: '8px', color: 'var(--stone)', display: 'block', marginBottom: '8px' }}>
                            Map File (.zip)
                        </label>
                        <input type="file" accept=".zip" onChange={e => handleUpload(e, 'map')}
                            style={{ color: 'var(--cream)', fontFamily: 'var(--vt)' }} />
                        {uploading === 'map' && <p style={{ fontFamily: 'var(--pixel)', fontSize: '8px', color: 'var(--stone)', marginTop: '4px' }}>Uploading...</p>}
                        {form.fileUrl && <p style={{ fontFamily: 'var(--pixel)', fontSize: '8px', color: 'var(--green)', marginTop: '4px' }}>✓ {form.fileUrl}</p>}
                    </div>

                    {/* Published toggle */}
                    <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input
                            type="checkbox"
                            checked={form.published}
                            onChange={e => setForm({ ...form, published: e.target.checked })}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                        <label style={{ fontFamily: 'var(--pixel)', fontSize: '8px', color: 'var(--stone)' }}>
                            Published (visible to public)
                        </label>
                    </div>

                    {message && (
                        <p style={{ fontFamily: 'var(--pixel)', fontSize: '8px', color: 'var(--green)', marginBottom: '16px' }}>
                            {message}
                        </p>
                    )}

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="pixel-btn pixel-btn-green" onClick={handleSubmit}>
                            {editingId ? 'Update Map' : 'Create Map'}
                        </button>
                        {editingId && (
                            <button className="pixel-btn pixel-btn-brown" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
                                Cancel
                            </button>
                        )}
                    </div>
                </div>

                {/* Map List */}
                <h2 style={{ fontSize: '12px', color: 'var(--sand)', marginBottom: '24px' }}>
                    [ Your Maps ]
                </h2>

                {maps.map(map => (
                    <div key={map.id} className="pixel-card" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ fontFamily: 'var(--pixel)', fontSize: '10px', color: 'var(--cream)', marginBottom: '4px' }}>
                                {map.title}
                            </p>
                            <p style={{ fontFamily: 'var(--pixel)', fontSize: '8px', color: 'var(--stone)' }}>
                                €{(map.price / 100).toFixed(2)} • {map.published ? '🟢 Live' : '🔴 Hidden'}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="pixel-btn pixel-btn-brown" style={{ fontSize: '8px' }} onClick={() => handleEdit(map)}>
                                Edit
                            </button>
                            <button className="pixel-btn pixel-btn-red" style={{ fontSize: '8px' }} onClick={() => handleDelete(map.id)}>
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}