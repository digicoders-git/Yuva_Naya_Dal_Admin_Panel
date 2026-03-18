import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Stack,
  VStack,
  HStack,
  Icon,
  Badge,
  Button,
  Avatar,
  Card,
  CardBody,
  Flex,
  IconButton,
  Spinner,
} from '@chakra-ui/react';
import {
  Users,
  MessageSquare,
  Image as ImageIcon,
  Clock,
  TrendingUp,
  TrendingDown,
  MoreHorizontal
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL;

// Group records by month for last 6 months
const buildChartData = (members, enquiries) => {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      name: d.toLocaleString('hi-IN', { month: 'short' }),
      apps: 0,
      enquiries: 0,
    });
  }

  members.forEach(m => {
    const d = new Date(m.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const slot = months.find(x => x.key === key);
    if (slot) slot.apps += 1;
  });

  enquiries.forEach(e => {
    const d = new Date(e.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const slot = months.find(x => x.key === key);
    if (slot) slot.enquiries += 1;
  });

  return months.map(({ name, apps, enquiries }) => ({ name, apps, enquiries }));
};

// Count records created in current calendar month
const countThisMonth = (records) => {
  const now = new Date();
  return records.filter(r => {
    const d = new Date(r.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
};

// Count records created in previous calendar month
const countLastMonth = (records) => {
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return records.filter(r => {
    const d = new Date(r.createdAt);
    return d.getMonth() === prev.getMonth() && d.getFullYear() === prev.getFullYear();
  }).length;
};

const formatChange = (thisMonth, lastMonth) => {
  const diff = thisMonth - lastMonth;
  return { label: diff >= 0 ? `+${diff}` : `${diff}`, isPositive: diff >= 0 };
};

// Build recent activity from latest members + enquiries combined, sorted by date
const buildActivity = (members, enquiries) => {
  const items = [
    ...members.slice(0, 5).map(m => ({
      id: m._id,
      user: m.name,
      action: 'का सदस्यता आवेदन प्राप्त हुआ',
      time: m.createdAt,
      type: 'member',
    })),
    ...enquiries.slice(0, 5).map(e => ({
      id: e._id,
      user: e.name,
      action: 'ने पूछताछ संदेश भेजा',
      time: e.createdAt,
      type: 'enquiry',
    })),
  ];

  items.sort((a, b) => new Date(b.time) - new Date(a.time));

  return items.slice(0, 6).map(item => ({
    ...item,
    timeLabel: formatTimeAgo(item.time),
  }));
};

const formatTimeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} मिनट पहले`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} घंटे पहले`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'कल';
  return `${days} दिन पहले`;
};

const Dashboard = () => {
  const [members, setMembers] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [mediaCount, setMediaCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [mRes, eRes, imgRes] = await Promise.all([
          fetch(`${API_URL}/membership`),
          fetch(`${API_URL}/enquiries`),
          fetch(`${API_URL}/media`),
        ]);
        const mData = await mRes.json();
        const eData = await eRes.json();
        const imgData = await imgRes.json();

        if (mData.success) setMembers(mData.data);
        if (eData.success) setEnquiries(eData.data);
        if (imgData.success) setMediaCount(imgData.data.length);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  const memberChange = formatChange(countThisMonth(members), countLastMonth(members));
  const enquiryChange = formatChange(countThisMonth(enquiries), countLastMonth(enquiries));
  const unreadCount = enquiries.filter(e => !e.isRead).length;

  const stats = [
    {
      title: 'सदस्यता आवेदन',
      value: members.length.toLocaleString('hi-IN'),
      change: memberChange.label,
      isPositive: memberChange.isPositive,
      icon: Users,
      color: 'navy.500',
      bg: 'navy.50',
    },
    {
      title: 'पूछताछ (Enquiries)',
      value: enquiries.length.toLocaleString('hi-IN'),
      change: enquiryChange.label,
      isPositive: enquiryChange.isPositive,
      icon: MessageSquare,
      color: 'saffron.500',
      bg: 'saffron.50',
    },
    {
      title: 'गैलरी फोटो',
      value: mediaCount.toLocaleString('hi-IN'),
      change: '+0',
      isPositive: true,
      icon: ImageIcon,
      color: 'green.600',
      bg: 'green.50',
    },
    {
      title: 'अपठित संदेश',
      value: unreadCount.toLocaleString('hi-IN'),
      change: unreadCount > 0 ? `${unreadCount} नये` : '0',
      isPositive: unreadCount === 0,
      icon: Clock,
      color: 'orange.600',
      bg: 'orange.50',
    },
  ];

  const chartData = buildChartData(members, enquiries);
  const recentActivity = buildActivity(members, enquiries);

  if (isLoading) {
    return (
      <Flex h="80vh" w="full" align="center" justify="center">
        <Spinner size="xl" color="navy.500" thickness="4px" />
      </Flex>
    );
  }

  return (
    <VStack spacing={8} align="stretch" w="full" p={2}>
      {/* Header */}
      <Stack direction={{ base: 'column', sm: 'row' }} justify="space-between" align={{ base: 'flex-start', sm: 'center' }} spacing={4} borderBottom="1px" borderColor="gray.100" pb={6} mb={2}>
        <Box>
          <Heading size="lg" fontWeight="extrabold" color="navy.600">डैशबोर्ड (Dashboard)</Heading>
          <Text color="gray.500" fontSize="sm" fontWeight="medium">आज की गतिविधियों और संस्था के विकास का सारांश।</Text>
        </Box>
      </Stack>

      {/* Stats Grid */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={6}>
        {stats.map((stat, index) => (
          <Card key={index} bg="white" variant="outline" borderRadius="2xl" borderColor="gray.100" shadow="sm" transition="all 0.2s" _hover={{ shadow: 'md', transform: 'translateY(-4px)' }}>
            <CardBody>
              <Flex justify="space-between" align="start">
                <VStack align="start" spacing={1}>
                  <Text color="gray.500" fontSize="xs" fontWeight="bold" fontFamily="hindi">{stat.title}</Text>
                  <Heading size="md" color="navy.700">{stat.value}</Heading>
                </VStack>
                <Box p={3} bg={stat.bg} color={stat.color} borderRadius="xl">
                  <stat.icon size={22} />
                </Box>
              </Flex>
              <HStack mt={4} spacing={1} fontSize="xs">
                <Icon as={stat.isPositive ? TrendingUp : TrendingDown} color={stat.isPositive ? 'green.500' : 'orange.500'} />
                <Text color={stat.isPositive ? 'green.500' : 'orange.500'} fontWeight="bold">{stat.change}</Text>
                <Text color="gray.400">पिछले महीने से</Text>
              </HStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* Chart & Activity */}
      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
        {/* Area Chart */}
        <Box gridColumn={{ lg: 'span 2' }}>
          <Card variant="outline" bg="white" borderRadius="2xl" borderColor="gray.100" shadow="sm" h="full">
            <CardBody p={6}>
              <Flex justify="space-between" align="center" mb={10}>
                <Heading size="sm" color="navy.500" fontFamily="hindi">पिछले 6 महीनों का विकास</Heading>
                <HStack>
                  <Badge bg="navy.50" color="navy.500" borderRadius="full" px={3}>आवेदन</Badge>
                  <Badge bg="saffron.50" color="saffron.500" borderRadius="full" px={3}>पूछताछ</Badge>
                </HStack>
              </Flex>
              <Box h="320px" w="full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0D47A1" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#0D47A1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorEnq" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF9933" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#FF9933" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} allowDecimals={false} />
                    <ChartTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="apps" name="आवेदन" stroke="#0D47A1" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
                    <Area type="monotone" dataKey="enquiries" name="पूछताछ" stroke="#FF9933" strokeWidth={3} fillOpacity={1} fill="url(#colorEnq)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardBody>
          </Card>
        </Box>

        {/* Recent Activity */}
        <Card variant="outline" bg="white" borderRadius="2xl" borderColor="gray.100" shadow="sm">
          <CardBody p={6}>
            <Flex justify="space-between" align="center" mb={6}>
              <Heading size="sm" color="navy.500" fontFamily="hindi">हालिया गतिविधियाँ</Heading>
              <IconButton aria-label="More" icon={<MoreHorizontal size={20} />} variant="ghost" size="sm" color="gray.400" />
            </Flex>
            {recentActivity.length === 0 ? (
              <Text fontSize="sm" color="gray.400" textAlign="center" py={8}>कोई गतिविधि नहीं</Text>
            ) : (
              <VStack spacing={6} align="stretch">
                {recentActivity.map((activity) => (
                  <HStack key={activity.id} spacing={4} align="start">
                    <Avatar
                      size="sm"
                      name={activity.user}
                      bg={activity.type === 'member' ? 'navy.500' : 'saffron.500'}
                      color="white"
                      border="2px"
                      borderColor="white"
                      shadow="sm"
                    />
                    <VStack align="start" spacing={0} flex={1}>
                      <Text fontSize="xs" color="gray.700">
                        <Text as="span" fontWeight="bold" color="navy.700">{activity.user}</Text>{' '}
                        {activity.action}
                      </Text>
                      <Text fontSize="10px" color="gray.400" fontWeight="bold" mt={1}>{activity.timeLabel}</Text>
                    </VStack>
                  </HStack>
                ))}
              </VStack>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>
    </VStack>
  );
};

export default Dashboard;
