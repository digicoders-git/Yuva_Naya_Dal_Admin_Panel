import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Stack,
  Button,
  Card,
  CardBody,
  IconButton,
  Circle,
  Divider,
  Spinner,
  Flex,
  useToast,
} from '@chakra-ui/react';
import {
  Bell,
  CheckCircle2,
  UserPlus,
  Mail,
  Trash2,
  Clock,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

const formatTimeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'अभी';
  if (mins < 60) return `${mins} मिनट पहले`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} घंटे पहले`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'कल';
  return `${days} दिन पहले`;
};

// API helpers
const apiMarkRead = (type, id) =>
  fetch(`${API_URL}/${type === 'enquiry' ? 'enquiries' : 'membership'}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isRead: true }),
  });

const apiDelete = (type, id) =>
  fetch(`${API_URL}/${type === 'enquiry' ? 'enquiries' : 'membership'}/${id}`, {
    method: 'DELETE',
  });

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingIds, setLoadingIds] = useState({}); // { [id]: 'read' | 'delete' }
  const toast = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [eRes, mRes] = await Promise.all([
        fetch(`${API_URL}/enquiries`),
        fetch(`${API_URL}/membership`),
      ]);
      const eData = await eRes.json();
      const mData = await mRes.json();

      const items = [];

      if (eData.success) {
        eData.data.forEach(e => items.push({
          id: `enq-${e._id}`,
          _id: e._id,
          type: 'enquiry',
          title: 'नया पूछताछ संदेश',
          desc: `${e.name} ने "${e.subject}" विषय पर संदेश भेजा है।`,
          time: e.createdAt,
          read: e.isRead,
        }));
      }

      if (mData.success) {
        mData.data.forEach(m => items.push({
          id: `mem-${m._id}`,
          _id: m._id,
          type: 'member',
          title: 'नया सदस्यता आवेदन',
          desc: `${m.name} (${m.address}) का सदस्यता आवेदन प्राप्त हुआ। स्थिति: ${m.status === 'pending' ? 'विचाराधीन' : m.status === 'approved' ? 'स्वीकृत' : 'अस्वीकृत'}`,
          time: m.createdAt,
          read: m.isRead,
        }));
      }

      items.sort((a, b) => new Date(b.time) - new Date(a.time));
      setNotifications(items);
    } catch (err) {
      toast({ title: 'डेटा लोड नहीं हो सका', status: 'error', duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Single mark read
  const markRead = async (notif) => {
    if (notif.read) return;
    setLoadingIds(p => ({ ...p, [notif.id]: 'read' }));
    try {
      const res = await apiMarkRead(notif.type, notif._id);
      const data = await res.json();
      if (data.success) {
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
      } else {
        toast({ title: 'अपडेट विफल', status: 'error', duration: 3000 });
      }
    } catch {
      toast({ title: 'सर्वर से कनेक्ट नहीं हो सका', status: 'error', duration: 3000 });
    } finally {
      setLoadingIds(p => { const n = { ...p }; delete n[notif.id]; return n; });
    }
  };

  // Mark all read
  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    if (!unread.length) return;
    const ids = unread.map(n => n.id);
    setLoadingIds(p => Object.fromEntries([...Object.entries(p), ...ids.map(id => [id, 'read'])]));
    try {
      await Promise.all(unread.map(n => apiMarkRead(n.type, n._id)));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {
      toast({ title: 'कुछ सूचनाएं अपडेट नहीं हो सकीं', status: 'error', duration: 3000 });
    } finally {
      setLoadingIds({});
    }
  };

  // Single delete
  const deleteOne = async (notif) => {
    setLoadingIds(p => ({ ...p, [notif.id]: 'delete' }));
    try {
      const res = await apiDelete(notif.type, notif._id);
      const data = await res.json();
      if (data.success) {
        setNotifications(prev => prev.filter(n => n.id !== notif.id));
      } else {
        toast({ title: 'हटाने में विफल', status: 'error', duration: 3000 });
      }
    } catch {
      toast({ title: 'सर्वर से कनेक्ट नहीं हो सका', status: 'error', duration: 3000 });
    } finally {
      setLoadingIds(p => { const n = { ...p }; delete n[notif.id]; return n; });
    }
  };

  // Delete all
  const deleteAll = async () => {
    const ids = notifications.map(n => n.id);
    setLoadingIds(Object.fromEntries(ids.map(id => [id, 'delete'])));
    try {
      await Promise.all(notifications.map(n => apiDelete(n.type, n._id)));
      setNotifications([]);
    } catch {
      toast({ title: 'कुछ सूचनाएं नहीं हटाई जा सकीं', status: 'error', duration: 3000 });
      fetchData();
    } finally {
      setLoadingIds({});
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeStyles = (type) =>
    type === 'enquiry'
      ? { bg: 'saffron.50', color: 'saffron.500', icon: Mail }
      : { bg: 'navy.50', color: 'navy.500', icon: UserPlus };

  if (isLoading) {
    return (
      <Flex h="80vh" w="full" align="center" justify="center">
        <Spinner size="xl" color="navy.500" thickness="4px" />
      </Flex>
    );
  }

  return (
    <VStack spacing={6} align="stretch" w="full" p={2}>
      {/* Header */}
      <Stack
        direction={{ base: 'column', sm: 'row' }}
        justify="space-between"
        align={{ base: 'flex-start', sm: 'center' }}
        spacing={4}
        borderBottom="1px"
        borderColor="gray.100"
        pb={6}
        mb={2}
      >
        <Box>
          <HStack spacing={3}>
            <Heading size="lg" fontWeight="extrabold" color="navy.600">
              सूचनाएं (Notifications)
            </Heading>
            {unreadCount > 0 && (
              <Circle size="24px" bg="red.500" color="white">
                <Text fontSize="xs" fontWeight="bold">{unreadCount}</Text>
              </Circle>
            )}
          </HStack>
          <Text color="gray.500" fontSize="sm" fontWeight="medium">
            नये आवेदन और संदेशों की सूचनाएं।
          </Text>
        </Box>

        {notifications.length > 0 && (
          <HStack spacing={3}>
            <Button
              variant="ghost"
              leftIcon={<Trash2 size={16} />}
              fontSize="xs"
              fontWeight="bold"
              color="red.500"
              _hover={{ bg: 'red.50' }}
              onClick={deleteAll}
              isLoading={Object.values(loadingIds).includes('delete') && notifications.length > 1}
            >
              सभी मिटाएं
            </Button>
            <Button
              bg="navy.500"
              color="white"
              borderRadius="lg"
              fontSize="sm"
              fontWeight="bold"
              height="45px"
              px={6}
              leftIcon={<CheckCircle2 size={18} />}
              onClick={markAllRead}
              isDisabled={unreadCount === 0}
              _hover={{ bg: 'navy.600' }}
            >
              सब पढ़ा हुआ मार्क करें
            </Button>
          </HStack>
        )}
      </Stack>

      {/* List */}
      {notifications.length === 0 ? (
        <VStack py={20} spacing={4}>
          <Circle size="64px" bg="gray.50" color="gray.300">
            <Bell size={32} />
          </Circle>
          <Text color="gray.400" fontWeight="bold">कोई सूचना नहीं है।</Text>
        </VStack>
      ) : (
        <Card variant="outline" bg="white" borderRadius="2xl" shadow="sm" borderColor="gray.100" overflow="hidden">
          <CardBody p={0}>
            <VStack spacing={0} align="stretch">
              {notifications.map((notif, index) => {
                const styles = getTypeStyles(notif.type);
                const IconComp = styles.icon;
                const isReadLoading = loadingIds[notif.id] === 'read';
                const isDeleteLoading = loadingIds[notif.id] === 'delete';

                return (
                  <Box key={notif.id} opacity={isDeleteLoading ? 0.5 : 1} transition="opacity 0.2s">
                    <HStack
                      p={6}
                      spacing={5}
                      bg={!notif.read ? 'blue.50' : 'transparent'}
                      transition="all 0.2s"
                      align="start"
                      _hover={{ bg: notif.read ? 'gray.50' : 'blue.50' }}
                      position="relative"
                    >
                      {/* Unread left bar */}
                      {!notif.read && (
                        <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg="navy.500" borderRadius="full" />
                      )}

                      {/* Icon */}
                      <Circle size="48px" bg={styles.bg} color={styles.color} flexShrink={0}>
                        <IconComp size={22} />
                      </Circle>

                      {/* Content */}
                      <VStack align="start" spacing={1} flex={1} minW={0}>
                        <HStack justify="space-between" w="full" flexWrap="wrap" gap={1}>
                          <Text fontSize="sm" fontWeight="bold" color="navy.700" fontFamily="hindi">
                            {notif.title}
                          </Text>
                          <HStack spacing={1} color="gray.400" flexShrink={0}>
                            <Clock size={11} />
                            <Text fontSize="xs" fontWeight="bold">{formatTimeAgo(notif.time)}</Text>
                          </HStack>
                        </HStack>

                        <Text fontSize="sm" color="gray.600" lineHeight="relaxed">
                          {notif.desc}
                        </Text>

                        {!notif.read && (
                          <Button
                            size="xs"
                            variant="link"
                            color="navy.500"
                            fontSize="xs"
                            fontWeight="bold"
                            mt={1}
                            isLoading={isReadLoading}
                            onClick={() => markRead(notif)}
                          >
                            पढ़ा हुआ मार्क करें
                          </Button>
                        )}
                      </VStack>

                      {/* Delete button */}
                      <IconButton
                        aria-label="Delete"
                        icon={isDeleteLoading ? <Spinner size="xs" /> : <Trash2 size={15} />}
                        variant="ghost"
                        size="sm"
                        color="gray.300"
                        borderRadius="lg"
                        _hover={{ color: 'red.400', bg: 'red.50' }}
                        isDisabled={isDeleteLoading}
                        onClick={() => deleteOne(notif)}
                        flexShrink={0}
                      />
                    </HStack>
                    {index < notifications.length - 1 && <Divider borderColor="gray.50" />}
                  </Box>
                );
              })}
            </VStack>
          </CardBody>
        </Card>
      )}
    </VStack>
  );
};

export default Notifications;
