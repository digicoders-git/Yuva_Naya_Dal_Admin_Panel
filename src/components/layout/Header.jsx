import { useState, useEffect } from 'react';
import { Menu, Bell, ChevronDown, Clock, Calendar, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const Header = ({ toggleSidebar }) => {
  const [dateTime, setDateTime] = useState(new Date());
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchUnread = async () => {
    try {
      const [eRes, mRes] = await Promise.all([
        fetch(`${API_URL}/enquiries`),
        fetch(`${API_URL}/membership`),
      ]);
      const eData = await eRes.json();
      const mData = await mRes.json();
      const unreadEnq = eData.success ? eData.data.filter(e => !e.isRead).length : 0;
      const unreadMem = mData.success ? mData.data.filter(m => !m.isRead).length : 0;
      setUnreadCount(unreadEnq + unreadMem);
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/login');
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('hi-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('hi-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-navy-500 hover:bg-navy-50 rounded-xl transition-colors"
        >
          <Menu size={24} />
        </button>
        
        {/* Real-time Date and Time Section */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2.5 px-4 py-2 bg-navy-50/50 rounded-2xl border border-navy-50">
            <Calendar size={18} className="text-navy-500" />
            <span className="text-sm font-bold text-navy-700 font-hindi">
              {formatDate(dateTime)}
            </span>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2 bg-saffron-50/50 rounded-2xl border border-saffron-50">
            <Clock size={18} className="text-saffron-600" />
            <span className="text-sm font-bold text-navy-800 tracking-wider">
              {formatTime(dateTime)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        <button 
          onClick={() => navigate('/notifications')}
          className="p-2.5 text-navy-500 hover:bg-navy-50 rounded-2xl transition-all relative group"
        >
          <Bell size={20} className="group-active:scale-95 transition-transform" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        <div className="h-8 w-px bg-gray-100 mx-1"></div>

        <button 
          onClick={() => navigate('/settings')}
          className="flex items-center gap-3 p-1.5 hover:bg-gray-50 rounded-2xl transition-all group"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-navy-700 leading-none">Admin Panel</p>
            <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-wider">Super Admin</p>
          </div>
          <img 
            src="https://ui-avatars.com/api/?name=Admin+User&background=0D47A1&color=fff" 
            alt="Profile" 
            className="w-10 h-10 rounded-xl shadow-sm border border-navy-50 group-hover:border-navy-200 transition-colors"
          />
          <ChevronDown size={16} className="text-navy-300 hidden sm:block" />
        </button>

        <button
          onClick={handleLogout}
          className="p-2.5 text-red-400 hover:bg-red-50 rounded-2xl transition-all"
          title="लॉगआउट"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;
