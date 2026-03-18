import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Image as ImageIcon, 
  Bell, 
  Settings,
  X,
  LogOut,
  AlertTriangle
} from 'lucide-react';
import { 
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
  useToast,
  Box
} from '@chakra-ui/react';
import { useRef } from 'react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Membership Logs', path: '/users', icon: Users },
  { name: 'Enquiries', path: '/posts', icon: FileText },
  { name: 'Gallery', path: '/media', icon: ImageIcon },
  { name: 'Notifications', path: '/notifications', icon: Bell },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOpen: isAlertOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const toast = useToast();

  const handleLogout = () => {
    onClose();
    toast({
      title: 'सफलतापूर्वक लॉगआउट हुआ',
      status: 'info',
      duration: 3000,
      isClosable: true,
      position: 'top',
    });
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/30 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-72 bg-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r border-gray-100 shadow-xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-24 flex items-center justify-between px-6 border-b border-gray-50">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <img 
                  src="/logo.jpeg" 
                  alt="YND Logo" 
                  className="w-14 h-14 rounded-full object-cover border-2 border-navy-50 shadow-md group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-navy-500 leading-tight font-hindi tracking-wide">युवा न्याय दल</span>
                <span className="text-saffron-500 text-[12px] font-bold tracking-wider font-hindi mt-0.5">(अराजनैतिक)</span>
              </div>
            </Link>
            <button 
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 text-gray-400 hover:text-navy-500"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-navy-50 text-navy-600 font-extrabold shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-navy-500'
                  }`}
                >
                  <Icon 
                    size={20} 
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? 'text-navy-600' : 'text-gray-400'} 
                  />
                  <span className="text-sm tracking-wide font-hindi">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-100">
            <button 
              onClick={onOpen}
              className="flex items-center gap-4 px-4 py-3 w-full rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all font-bold group"
            >
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm tracking-wide font-hindi">लॉगआउट (Logout)</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Dialog */}
      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay backdropBlur="4px" bg="blackAlpha.300">
          <AlertDialogContent borderRadius="2xl" p={2}>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color="navy.700" display="flex" alignItems="center" gap={3}>
              <Box p={2} bg="red.50" color="red.500" borderRadius="lg">
                <AlertTriangle size={20} />
              </Box>
              लॉगआउट की पुष्टि करें
            </AlertDialogHeader>

            <AlertDialogBody color="gray.600" fontSize="md">
              क्या आप वाकई एडमिन पैनल से लॉगआउट करना चाहते हैं?
            </AlertDialogBody>

            <AlertDialogFooter gap={3}>
              <Button ref={cancelRef} onClick={onClose} variant="ghost" borderRadius="xl" fontWeight="bold">
                नहीं, रहें
              </Button>
              <Button bg="red.500" color="white" onClick={handleLogout} _hover={{ bg: 'red-600' }} borderRadius="xl" px={8} fontWeight="bold">
                हाँ, लॉगआउट करें
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default Sidebar;
