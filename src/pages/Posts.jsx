import {
  Box,
  Heading,
  Text,
  Stack,
  VStack,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Avatar,
  Card,
  CardBody,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
} from '@chakra-ui/react';
import { Search, Filter, Mail, Phone, MessageSquare, Eye, Trash2, MoreVertical } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';

const Enquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const fetchEnquiries = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/enquiries`);
      const data = await response.json();
      if (data.success) {
        setEnquiries(data.data);
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      toast({ title: 'डाटा लोड करने में विफल', status: 'error', duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const handleOpenEnquiry = (enquiry) => {
    setSelectedEnquiry(enquiry);
    onOpen();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('क्या आप वाकई इस संदेश को डिलीट करना चाहते हैं?')) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/enquiries/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: 'संदेश डिलीट कर दिया गया', status: 'info', duration: 2000 });
        fetchEnquiries();
        if (selectedEnquiry?._id === id) onClose();
      }
    } catch {
      toast({ title: 'डिलीट करने में विफल', status: 'error', duration: 3000 });
    }
  };

  const filteredEnquiries = enquiries.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.phone.includes(searchTerm) ||
    item.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredEnquiries.length / PAGE_SIZE);
  const paginatedEnquiries = filteredEnquiries.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const newCount = enquiries.filter(item => !item.isRead).length;

  const handleSearch = (val) => { setSearchTerm(val); setCurrentPage(1); };

  return (
    <VStack spacing={6} align="stretch" w="full" p={2}>
      <Stack direction={{ base: 'column', sm: 'row' }} justify="space-between" align={{ base: 'flex-start', sm: 'center' }} spacing={4} borderBottom="1px" borderColor="gray.100" pb={6} mb={2}>
        <Box>
          <Heading size="lg" fontWeight="extrabold" color="navy.600">पूछताछ और संदेश (Enquiries)</Heading>
          <Text color="gray.500" fontSize="sm" fontWeight="medium">वेबसाइट के संपर्क फॉर्म से प्राप्त सभी संदेश यहाँ देखें।</Text>
        </Box>
        <HStack spacing={4} bg="navy.50/50" p={2} pr={4} borderRadius="xl" border="1px" borderColor="navy.50">
          <Box p={2.5} bg="navy.500" color="white" borderRadius="lg" shadow="sm">
            <MessageSquare size={20} />
          </Box>
          <VStack align="start" spacing={0}>
            <Text fontSize="xl" fontWeight="extrabold" color="navy.700" lineHeight="1">{newCount}</Text>
            <Text fontSize="10px" fontWeight="bold" color="navy.400" textTransform="uppercase">नए संदेश</Text>
          </VStack>
        </HStack>
      </Stack>

      <Card variant="outline" bg="white" borderRadius="2xl" shadow="sm" overflow="hidden" borderColor="gray.100">
        <CardBody p={0}>
          <Stack direction={{ base: 'column', sm: 'row' }} p={4} spacing={4} bg="gray.50" borderBottom="1px" borderColor="gray.100">
            <InputGroup maxW={{ base: 'full', sm: 'xs' }}>
              <InputLeftElement pointerEvents="none">
                <Search size={18} color="navy.300" />
              </InputLeftElement>
              <Input
                placeholder="संदेश खोजें..."
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
              onClick={fetchEnquiries}
              isLoading={isLoading}
            >
              रिफ्रेश
            </Button>
          </Stack>

          <Box overflowX="auto">
            <Table variant="simple" size="sm" minW="800px">
              <Thead bg="gray.50">
                <Tr>
                  <Th color="navy.500" fontWeight="bold" whiteSpace="nowrap">नाम और दिनांक</Th>
                  <Th color="navy.500" fontWeight="bold" whiteSpace="nowrap">संपर्क विवरण</Th>
                  <Th color="navy.500" fontWeight="bold" whiteSpace="nowrap">विषय और संदेश</Th>
                  <Th color="navy.500" fontWeight="bold" whiteSpace="nowrap">स्थिति</Th>
                  <Th textAlign="right" color="navy.500" fontWeight="bold" whiteSpace="nowrap">कार्रवाई</Th>
                </Tr>
              </Thead>
              <Tbody>
                {isLoading ? (
                  <Tr><Td colSpan={5} textAlign="center" py={10}><Text>संदेश लोड हो रहे हैं...</Text></Td></Tr>
                ) : filteredEnquiries.length === 0 ? (
                  <Tr><Td colSpan={5} textAlign="center" py={10}><Text>कोई संदेश नहीं मिला।</Text></Td></Tr>
                ) : paginatedEnquiries.map((item) => (
                  <Tr key={item._id} _hover={{ bg: 'blue.50/30' }} transition="background 0.2s">
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold" fontSize="sm" color="navy.700" fontFamily="hindi">{item.name}</Text>
                        <Text fontSize="2xs" color="gray.400">{new Date(item.createdAt).toLocaleString()}</Text>
                      </VStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <HStack spacing={2} fontSize="xs" color="navy.600">
                          <Phone size={12} />
                          <Text fontWeight="bold">{item.phone}</Text>
                        </HStack>
                        <HStack spacing={2} fontSize="xs" color="gray.500">
                          <Mail size={12} />
                          <Text isTruncated maxW="150px">{item.email}</Text>
                        </HStack>
                      </VStack>
                    </Td>
                    <Td maxW="300px">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold" fontSize="xs" color="orange.600" noOfLines={1}>{item.subject}</Text>
                        <Text fontSize="xs" color="gray.600" noOfLines={2} fontStyle="italic">"{item.message}"</Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Badge 
                        colorScheme={!item.isRead ? 'blue' : 'gray'} 
                        variant="solid"
                        borderRadius="full" 
                        px={3}
                        fontSize="2xs"
                        fontWeight="black"
                      >
                        {!item.isRead ? 'नया' : 'पढ़ा हुआ'}
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
                          onClick={() => handleOpenEnquiry(item)}
                        />
                        <IconButton
                          aria-label="Delete"
                          icon={<Trash2 size={18} />}
                          size="sm"
                          variant="ghost"
                          color="red.500"
                          _hover={{ bg: 'red.50' }}
                          onClick={() => handleDelete(item._id)}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
          {totalPages > 1 && (
            <HStack justify="space-between" px={4} py={3} borderTop="1px" borderColor="gray.100">
              <Text fontSize="sm" color="gray.500">
                {filteredEnquiries.length} में से {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredEnquiries.length)} दिखाए जा रहे हैं
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
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="2xl" shadow="2xl">
          <ModalHeader borderBottomWidth="1px" borderColor="gray.100" color="navy.500" fontFamily="hindi">संदेश विवरण</ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            {selectedEnquiry && (
              <VStack spacing={6} align="stretch">
                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="2xs" fontWeight="bold" color="gray.400" textTransform="uppercase">भेजने वाला</Text>
                    <Text fontSize="xl" fontWeight="bold" color="navy.700" fontFamily="hindi">{selectedEnquiry.name}</Text>
                  </VStack>
                  <VStack align="end" spacing={0}>
                    <Text fontSize="2xs" fontWeight="bold" color="gray.400" textTransform="uppercase">दिनांक</Text>
                    <Text fontSize="sm" fontWeight="medium" color="gray.700">{new Date(selectedEnquiry.createdAt).toLocaleString()}</Text>
                  </VStack>
                </HStack>

                <SimpleGrid columns={2} gap={4}>
                  <Box p={3} bg="gray.50" borderRadius="xl" border="1px" borderColor="gray.100">
                    <Text fontSize="2xs" fontWeight="bold" color="gray.400" textTransform="uppercase">मोबाइल</Text>
                    <Text fontWeight="bold" color="navy.600">{selectedEnquiry.phone}</Text>
                  </Box>
                  <Box p={3} bg="gray.50" borderRadius="xl" border="1px" borderColor="gray.100">
                    <Text fontSize="2xs" fontWeight="bold" color="gray.400" textTransform="uppercase">ईमेल</Text>
                    <Text fontWeight="bold" color="navy.600">{selectedEnquiry.email}</Text>
                  </Box>
                </SimpleGrid>

                <Box p={4} bg="navy.50" borderRadius="xl" border="1px" borderColor="navy.100">
                  <Text fontSize="2xs" fontWeight="bold" color="navy.400" textTransform="uppercase" mb={2}>विषय</Text>
                  <Text fontWeight="bold" color="navy.800">{selectedEnquiry.subject}</Text>
                </Box>

                <Box>
                  <Text fontSize="2xs" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={2}>संदेश</Text>
                  <Box p={4} bg="white" border="1px" borderColor="gray.100" borderRadius="xl" fontStyle="italic">
                    <Text color="gray.700" lineHeight="tall">{selectedEnquiry.message}</Text>
                  </Box>
                </Box>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default Enquiries;
