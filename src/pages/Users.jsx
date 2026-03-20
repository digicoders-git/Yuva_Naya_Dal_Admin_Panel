import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  HStack,
  VStack,
  Stack,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Card,
  CardBody,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
  Divider,
} from '@chakra-ui/react';
import { Search, Filter, MoreVertical, Eye, Trash2, CheckCircle, Clock, User, Phone, Mail, MapPin, Briefcase, GraduationCap, Calendar, CreditCard } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const [selectedUser, setSelectedUser] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/membership`);
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'डेटा लोड करने में विफल',
        description: 'सर्वर से संपर्क नहीं हो सका।',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenDetail = (user) => {
    setSelectedUser(user);
    onOpen();
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/membership/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: `आवेदन ${status === 'approved' ? 'स्वीकृत' : 'रिजेक्ट'} कर दिया गया`, status: 'success', duration: 2000 });
        fetchUsers();
        if (selectedUser?._id === id) onClose();
      }
    } catch (error) {
      toast({ title: 'अपडेट करने में विफल', status: 'error', duration: 3000 });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('क्या आप वाकई इस आवेदन को डिलीट करना चाहते हैं?')) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/membership/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: 'आवेदन डिलीट कर दिया गया', status: 'info', duration: 2000 });
        fetchUsers();
      }
    } catch (error) {
      toast({ title: 'डिलीट करने में विफल', status: 'error', duration: 3000 });
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  );
  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const pendingCount = users.filter(user => user.status === 'pending').length;

  const handleSearch = (val) => { setSearchTerm(val); setCurrentPage(1); };

  return (
    <VStack spacing={6} align="stretch" w="full" p={2}>
      {/* Header Section */}
      <Stack direction={{ base: 'column', sm: 'row' }} justify="space-between" align={{ base: 'flex-start', sm: 'center' }} spacing={4} borderBottom="1px" borderColor="gray.100" pb={6} mb={2}>
        <Box>
          <Heading size="lg" fontWeight="extrabold" color="navy.600">सदस्यता आवेदन (Membership Logs)</Heading>
          <Text color="gray.500" fontSize="sm" fontWeight="medium">वेबसाइट से प्राप्त सभी सदस्यता आवेदनों की सूची यहाँ देखें।</Text>
        </Box>
        <HStack spacing={4} bg="navy.50/50" p={2} pr={4} borderRadius="xl" border="1px" borderColor="navy.50">
          <Box p={2.5} bg="navy.500" color="white" borderRadius="lg" shadow="sm">
            <Clock size={20} />
          </Box>
          <VStack align="start" spacing={0}>
            <Text fontSize="xl" fontWeight="extrabold" color="navy.700" lineHeight="1">{pendingCount}</Text>
            <Text fontSize="10px" fontWeight="bold" color="navy.400" textTransform="uppercase">नए आवेदन</Text>
          </VStack>
        </HStack>
      </Stack>

      <Card variant="outline" bg="white" borderRadius="2xl" shadow="sm" overflow="hidden" borderColor="gray.100">
        <CardBody p={0}>
          {/* Filter Bar */}
          <Stack direction={{ base: 'column', sm: 'row' }} p={4} spacing={4} bg="gray.50" borderBottom="1px" borderColor="gray.100">
            <InputGroup maxW={{ base: 'full', sm: 'xs' }}>
              <InputLeftElement pointerEvents="none">
                <Search size={18} color="navy.300" />
              </InputLeftElement>
              <Input
                placeholder="नाम या मोबाइल से खोजें..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                bg="white"
                borderRadius="xl"
                fontSize="sm"
                borderColor="gray.200"
                _focus={{ borderColor: 'navy.500', boxShadow: '0 0 0 1px #0D47A1' }}
              />
            </InputGroup>
            <Button 
              leftIcon={<Filter size={16} />} 
              variant="outline" 
              borderColor="gray.200"
              color="navy.500"
              bg="white"
              borderRadius="xl" 
              fontSize="sm"
              onClick={fetchUsers}
              isLoading={isLoading}
            >
              रिफ्रेश
            </Button>
          </Stack>

          {/* Table Container */}
          <Box overflowX="auto">
            <Table variant="simple" size="sm" minW="800px">
              <Thead bg="gray.50">
                <Tr>
                  <Th color="navy.500" fontWeight="bold" whiteSpace="nowrap">आवेदक</Th>
                  <Th color="navy.500" fontWeight="bold" whiteSpace="nowrap">संपर्क और पता</Th>
                  <Th color="navy.500" fontWeight="bold" whiteSpace="nowrap">दिनांक</Th>
                  <Th color="navy.500" fontWeight="bold" whiteSpace="nowrap">स्थिति</Th>
                  <Th textAlign="right" color="navy.500" fontWeight="bold" whiteSpace="nowrap">कार्रवाई</Th>
                </Tr>
              </Thead>
              <Tbody>
                {isLoading ? (
                  <Tr><Td colSpan={5} textAlign="center" py={10}><Text>डेटा लोड हो रहा है...</Text></Td></Tr>
                ) : filteredUsers.length === 0 ? (
                  <Tr><Td colSpan={5} textAlign="center" py={10}><Text>कोई आवेदन नहीं मिला।</Text></Td></Tr>
                ) : paginatedUsers.map((user) => (
                  <Tr key={user._id} _hover={{ bg: 'blue.50/30' }} transition="background 0.2s">
                    <Td>
                      <HStack spacing={3}>
                        <Avatar size="sm" name={user.name} src={`https://ui-avatars.com/api/?name=${user.name}&background=0D47A1&color=fff`} />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="bold" fontSize="sm" color="navy.700" fontFamily="hindi">{user.name}</Text>
                          <Text fontSize="2xs" color="gray.500">पिता: {user.fatherName}</Text>
                        </VStack>
                      </HStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <HStack spacing={2} color="navy.600">
                          <Text fontSize="xs" fontWeight="bold">{user.phone}</Text>
                          {user.email && (
                            <>
                              <Text fontSize="xs" color="gray.300">|</Text>
                              <Text fontSize="xs" color="gray.600" isTruncated maxW="150px">{user.email}</Text>
                            </>
                          )}
                        </HStack>
                        <Badge variant="subtle" colorScheme="navy" fontSize="2xs" borderRadius="full" isTruncated maxW="200px">{user.address}</Badge>
                      </VStack>
                    </Td>
                    <Td>
                      <Text fontSize="xs" color="gray.600" fontWeight="medium">{new Date(user.createdAt).toLocaleDateString()}</Text>
                    </Td>
                    <Td>
                      <Badge 
                        colorScheme={user.status === 'approved' ? 'green' : user.status === 'rejected' ? 'red' : 'orange'} 
                        variant="solid" 
                        fontSize="2xs"
                        px={3}
                        borderRadius="full"
                        display="flex"
                        alignItems="center"
                        gap={1}
                        w="fit-content"
                        textTransform="capitalize"
                      >
                        {user.status === 'approved' ? <CheckCircle size={10} /> : user.status === 'rejected' ? <Trash2 size={10} /> : <Clock size={10} />}
                        {user.status === 'approved' ? 'स्वीकृत' : user.status === 'rejected' ? 'रिजेक्ट' : 'लंबित'}
                      </Badge>
                    </Td>
                    <Td textAlign="right">
                      <HStack justify="flex-end" spacing={1}>
                        <IconButton
                          aria-label="View"
                          icon={<Eye size={18} />}
                          size="sm"
                          variant="ghost"
                          color="navy.500"
                          _hover={{ bg: 'navy.50' }}
                          onClick={() => handleOpenDetail(user)}
                        />
                        <IconButton
                          aria-label="Delete"
                          icon={<Trash2 size={18} />}
                          size="sm"
                          variant="ghost"
                          color="red.500"
                          _hover={{ bg: 'red.50' }}
                          onClick={() => handleDelete(user._id)}
                        />
                        <Menu>
                          <MenuButton as={IconButton} icon={<MoreVertical size={18} />} variant="ghost" size="sm" />
                          <MenuList shadow="xl" borderRadius="xl" border="none">
                            <MenuItem icon={<CheckCircle size={16} />} color="green.600" onClick={() => handleUpdateStatus(user._id, 'approved')}>स्वीकृत करें</MenuItem>
                            <MenuItem icon={<Trash2 size={16} />} color="red.600" onClick={() => handleUpdateStatus(user._id, 'rejected')}>रिजेक्ट करें</MenuItem>
                          </MenuList>
                        </Menu>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
          {/* Pagination */}
          {totalPages > 1 && (
            <HStack justify="space-between" px={4} py={3} borderTop="1px" borderColor="gray.100">
              <Text fontSize="sm" color="gray.500">
                {filteredUsers.length} में से {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredUsers.length)} दिखाए जा रहे हैं
              </Text>
              <HStack spacing={1}>
                <Button size="sm" variant="outline" borderRadius="lg" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} isDisabled={currentPage === 1}>पिछला</Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    size="sm"
                    borderRadius="lg"
                    bg={currentPage === page ? 'navy.500' : 'white'}
                    color={currentPage === page ? 'white' : 'navy.500'}
                    variant={currentPage === page ? 'solid' : 'outline'}
                    onClick={() => setCurrentPage(page)}
                  >{page}</Button>
                ))}
                <Button size="sm" variant="outline" borderRadius="lg" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} isDisabled={currentPage === totalPages}>अगला</Button>
              </HStack>
            </HStack>
          )}
        </CardBody>
      </Card>

      {/* Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="3xl" overflow="hidden" shadow="2xl">
          <ModalHeader bg="navy.600" color="white" py={8} px={8}>
            <HStack spacing={5}>
              <Avatar size="xl" name={selectedUser?.name} src={`https://ui-avatars.com/api/?name=${selectedUser?.name}&background=fff&color=0D47A1`} border="4px" borderColor="whiteAlpha.400" />
              <VStack align="start" spacing={1}>
                <Heading size="lg" color="white" fontFamily="hindi" lineHeight="tight">{selectedUser?.name}</Heading>
                <Badge bg="whiteAlpha.300" color="white" px={3} py={1} borderRadius="lg" fontSize="xs">आईडी: {selectedUser?._id.slice(-6).toUpperCase()}</Badge>
              </VStack>
            </HStack>
            <ModalCloseButton color="white" size="lg" mt={2} />
          </ModalHeader>
          
          <ModalBody p={10}>
            <VStack spacing={10} align="stretch">
              {/* Basic Info */}
              <Box>
                <HStack mb={6} color="navy.600">
                  <Box p={2} bg="navy.50" borderRadius="lg">
                    <User size={20} />
                  </Box>
                  <Heading size="sm" color="navy.600" textTransform="uppercase" letterSpacing="widest">व्यक्तिगत जानकारी</Heading>
                </HStack>
                <SimpleGrid columns={2} spacing={8}>
                  <Box>
                    <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase" mb={1}>पिता का नाम</Text>
                    <Text fontSize="lg" fontWeight="extrabold" color="navy.800" fontFamily="hindi">{selectedUser?.fatherName}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase" mb={1}>आवेदन की तिथि</Text>
                    <HStack spacing={2} color="navy.800">
                      <Calendar size={16} className="text-navy-400" />
                      <Text fontSize="lg" fontWeight="extrabold">{new Date(selectedUser?.createdAt).toLocaleDateString()}</Text>
                    </HStack>
                  </Box>
                </SimpleGrid>
              </Box>

              <Divider borderColor="gray.100" borderBottomWidth="2px" />

              {/* Contact & Address */}
              <Box>
                <HStack mb={6} color="navy.600">
                  <Box p={2} bg="navy.50" borderRadius="lg">
                    <MapPin size={20} />
                  </Box>
                  <Heading size="sm" color="navy.600" textTransform="uppercase" letterSpacing="widest">संपर्क और पता</Heading>
                </HStack>
                <VStack align="stretch" spacing={6}>
                  <SimpleGrid columns={2} spacing={8}>
                    <Box>
                      <HStack spacing={3} mb={2}>
                        <Phone size={18} className="text-navy-300" />
                        <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase">मोबाइल नंबर</Text>
                      </HStack>
                      <Text fontSize="lg" fontWeight="extrabold" color="navy.800">{selectedUser?.phone}</Text>
                    </Box>
                    <Box>
                      <HStack spacing={3} mb={2}>
                        <Mail size={18} className="text-navy-300" />
                        <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase">ईमेल पता</Text>
                      </HStack>
                      <Text fontSize="lg" fontWeight="extrabold" color="navy.800">{selectedUser?.email || 'उपलब्ध नहीं'}</Text>
                    </Box>
                  </SimpleGrid>
                  <Box p={6} bg="navy.50/30" borderRadius="2xl" border="2px" borderStyle="dashed" borderColor="navy.100">
                    <Text fontSize="xs" color="navy.400" fontWeight="bold" textTransform="uppercase" mb={2}>पूरा पता (Full Address)</Text>
                    <Text color="navy.900" fontSize="md" fontWeight="bold" fontFamily="hindi" lineHeight="relaxed">{selectedUser?.address}</Text>
                  </Box>
                </VStack>
              </Box>
              
              <Divider borderColor="gray.100" borderBottomWidth="2px" />
              
              <Box>
                <HStack mb={6} color="navy.600">
                  <Box p={2} bg="navy.50" borderRadius="lg">
                    <Clock size={20} />
                  </Box>
                  <Heading size="sm" color="navy.600" textTransform="uppercase" letterSpacing="widest">आवेदन की स्थिति</Heading>
                </HStack>
                <Badge 
                  colorScheme={selectedUser?.status === 'approved' ? 'green' : selectedUser?.status === 'rejected' ? 'red' : 'orange'} 
                  variant="solid" 
                  fontSize="sm"
                  px={6}
                  py={2}
                  borderRadius="xl"
                  textTransform="uppercase"
                >
                  {selectedUser?.status === 'approved' ? 'स्वीकृत (Approved)' : selectedUser?.status === 'rejected' ? 'निरस्त (Rejected)' : 'लंबित (Pending)'}
                </Badge>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter bg="gray.50" p={8} borderTop="1px" borderColor="gray.100">
            <Button variant="ghost" mr={4} onClick={onClose} borderRadius="xl" size="lg" fontWeight="bold" color="gray.500">बंद करें</Button>
            <HStack spacing={4}>
              <Button colorScheme="red" variant="outline" borderRadius="xl" size="lg" px={8} leftIcon={<Trash2 size={20} />} fontWeight="bold" onClick={() => handleUpdateStatus(selectedUser?._id, 'rejected')}>रिजेक्ट करें</Button>
              <Button bg="navy.500" color="white" borderRadius="xl" size="lg" px={8} leftIcon={<CheckCircle size={20} />} fontWeight="bold" _hover={{ bg: 'navy.600', transform: 'translateY(-2px)' }} shadow="lg" onClick={() => handleUpdateStatus(selectedUser?._id, 'approved')}>आवेदन स्वीकृत करें</Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default Users;
