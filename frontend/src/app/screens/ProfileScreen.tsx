import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { LogOut, Phone, Save, Home, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { me as fetchProfile, updateProfile, type AuthUser as ApiProfile } from '../services/auth.service';
import { motion } from 'motion/react';

export function ProfileScreen() {
  const navigate = useNavigate();
  const { accessToken, logout } = useAuth();
  const [profile, setProfile] = useState<ApiProfile | null>(null);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!accessToken) {
      navigate('/login');
      return;
    }
    fetchProfile(accessToken)
      .then((p) => {
        setProfile(p);
        setPhone(p.phone || '');
        setAddress(p.address || '');
      })
      .catch(() => setMessage('โหลดโปรไฟล์ไม่สำเร็จ'));
  }, [accessToken, navigate]);

  const handleSave = async () => {
    if (!accessToken) return;
    setSaving(true);
    setMessage('');
    try {
      const updated = await updateProfile(accessToken, { phone, address });
      setProfile(updated);
      setMessage('บันทึกข้อมูลเรียบร้อย');
      setTimeout(() => setMessage(''), 2500);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(135deg, #FFF8F0 0%, #FFF0E6 100%)' }}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-stone-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-stone-900 font-bold" style={{ fontSize: 18 }}>โปรไฟล์ของฉัน</h1>
          <p className="text-stone-400" style={{ fontSize: 11 }}>จัดการข้อมูลส่วนตัว</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 border-2 border-stone-100"
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
              <span style={{ fontSize: 40 }}>👤</span>
            </div>
            <div className="flex-1">
              <h2 className="text-stone-900 font-bold" style={{ fontSize: 18 }}>
                {profile?.first_name && profile?.last_name 
                  ? `${profile.first_name} ${profile.last_name}`
                  : profile?.username || 'ผู้ใช้งาน'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-3 py-1 rounded-lg bg-orange-50 text-orange-600" style={{ fontSize: 11, fontWeight: 600 }}>
                  {profile?.role === 'seller' ? '🏪 ผู้ขาย' : '👤 ซื้อสินค้า'}
                </span>
                <span className="text-stone-400" style={{ fontSize: 12 }}>
                  {profile?.email}
                </span>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
              <p className="text-stone-400" style={{ fontSize: 11, fontWeight: 600 }}>บทบาท</p>
              <p className="text-stone-800 font-bold mt-1" style={{ fontSize: 14 }}>
                {profile?.role === 'seller' ? 'ผู้ขาย' : 'ผู้ซื้อ'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
              <p className="text-stone-400" style={{ fontSize: 11, fontWeight: 600 }}>สถานะ</p>
              <p className="text-green-600 font-bold mt-1" style={{ fontSize: 14 }}>✓ ยืนยันแล้ว</p>
            </div>
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 border-2 border-stone-100"
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
        >
          <h3 className="text-stone-900 font-bold mb-5" style={{ fontSize: 16 }}>ข้อมูลติดต่อ</h3>

          {/* Phone */}
          <div className="mb-4">
            <label className="flex items-center gap-2 text-stone-600 mb-2" style={{ fontSize: 13, fontWeight: 600 }}>
              <Phone size={16} className="text-orange-500" />
              เบอร์โทรศัพท์
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="กรุณากรอกเบอร์โทรศัพท์"
              className="w-full border-2 border-stone-100 rounded-2xl px-4 py-3 focus:border-orange-300 focus:outline-none transition-colors"
              style={{ fontSize: 14, fontFamily: 'Sarabun, sans-serif' }}
            />
          </div>

          {/* Address */}
          <div className="mb-4">
            <label className="flex items-center gap-2 text-stone-600 mb-2" style={{ fontSize: 13, fontWeight: 600 }}>
              <Home size={16} className="text-orange-500" />
              ที่อยู่
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="กรุณากรอกที่อยู่ของคุณ"
              rows={3}
              className="w-full border-2 border-stone-100 rounded-2xl px-4 py-3 focus:border-orange-300 focus:outline-none transition-colors resize-none"
              style={{ fontSize: 14, fontFamily: 'Sarabun, sans-serif' }}
            />
          </div>

          {/* Message */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-xl mb-4 text-sm font-medium ${
                message.includes('เรียบร้อย')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
              style={{ fontSize: 13 }}
            >
              {message}
            </motion.div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl py-3.5 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60 shadow-md shadow-orange-200 hover:shadow-lg hover:shadow-orange-200"
            style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Sarabun, sans-serif' }}
          >
            <Save size={18} />
            {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
          </button>
        </motion.div>

        {/* Action Links */}
        {profile?.role === 'seller' && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => navigate('/dashboard')}
            className="w-full bg-white border-2 border-orange-200 rounded-3xl p-4 flex items-center justify-between hover:border-orange-400 hover:shadow-md transition-all active:scale-[0.98]"
            style={{ boxShadow: '0 2px 8px rgba(249,115,22,0.1)' }}
          >
            <div className="text-left">
              <p className="text-orange-600 font-bold" style={{ fontSize: 15 }}>แดชบอร์ดผู้ขาย</p>
              <p className="text-stone-400" style={{ fontSize: 12 }}>จัดการร้านค้าของคุณ</p>
            </div>
            <ArrowRight size={20} className="text-orange-500" />
          </motion.button>
        )}

        {/* Logout Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-full bg-red-50 border-2 border-red-200 text-red-600 rounded-3xl py-3.5 flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:border-red-300 hover:shadow-md hover:shadow-red-100"
          style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Sarabun, sans-serif' }}
        >
          <LogOut size={18} />
          ออกจากระบบ
        </motion.button>
      </div>
    </div>
  );
}
