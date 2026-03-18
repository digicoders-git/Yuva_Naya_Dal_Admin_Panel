import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Stack,
  Button,
  SimpleGrid,
  Image,
  Badge,
  IconButton,
  Card,
  CardBody,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  AspectRatio,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { UploadCloud, Plus, Trash2, Pencil } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = API_URL.replace('/api', '');

const Media = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [hoveredId, setHoveredId] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);
  const [form, setForm] = useState({ title: '', description: '' });
  const [file, setFile] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [editFile, setEditFile] = useState(null);
  const fileRef = useRef();
  const editFileRef = useRef();
  const toast = useToast();

  const fetchGallery = async () => {
    try {
      const res = await fetch(`${API_URL}/media`);
      const data = await res.json();
      if (data.success) setGallery(data.data);
    } catch {
      toast({ title: 'गैलरी लोड नहीं हो सकी', status: 'error', duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGallery(); }, []);

  const handleUpload = async () => {
    if (!file) return toast({ title: 'कृपया एक फोटो चुनें', status: 'warning', duration: 3000 });
    if (!form.title.trim()) return toast({ title: 'कृपया शीर्षक भरें', status: 'warning', duration: 3000 });

    setUploading('new');
    const fd = new FormData();
    fd.append('image', file);
    fd.append('title', form.title);
    fd.append('description', form.description);

    try {
      const res = await fetch(`${API_URL}/media`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'फोटो सफलतापूर्वक जोड़ी गई', status: 'success', duration: 3000 });
        setForm({ title: '', description: '' });
        setFile(null);
        onClose();
        fetchGallery();
      } else {
        toast({ title: data.error || 'अपलोड विफल', status: 'error', duration: 5000, isClosable: true });
      }
    } catch {
      toast({ title: 'सर्वर से कनेक्ट नहीं हो सका', status: 'error', duration: 3000 });
    } finally {
      setUploading(null);
    }
  };

  const handleEditOpen = (item) => {
    setEditItem(item);
    setEditForm({ title: item.title, description: item.description || '' });
    setEditFile(null);
    onEditOpen();
  };

  const handleUpdate = async () => {
    if (!editForm.title.trim()) return toast({ title: 'शीर्षक खाली नहीं हो सकता', status: 'warning', duration: 3000 });
    setUploading('edit');
    const fd = new FormData();
    fd.append('title', editForm.title);
    fd.append('description', editForm.description);
    if (editFile) fd.append('image', editFile);
    try {
      const res = await fetch(`${API_URL}/media/${editItem._id}`, { method: 'PUT', body: fd });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'फोटो अपडेट हो गई', status: 'success', duration: 3000 });
        onEditClose();
        fetchGallery();
      } else {
        toast({ title: data.error || 'अपडेट विफल', status: 'error', duration: 3000 });
      }
    } catch {
      toast({ title: 'सर्वर से कनेक्ट नहीं हो सका', status: 'error', duration: 3000 });
    } finally {
      setUploading(null);
    }
  };

  const handleDelete = async (id) => {
    setUploading(id);
    try {
      const res = await fetch(`${API_URL}/media/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'फोटो हटा दी गई', status: 'success', duration: 3000 });
        setGallery(prev => prev.filter(item => item._id !== id));
      } else {
        toast({ title: 'हटाने में विफल', status: 'error', duration: 3000 });
      }
    } catch {
      toast({ title: 'सर्वर से कनेक्ट नहीं हो सका', status: 'error', duration: 3000 });
    } finally {
      setUploading(null);
    }
  };

  return (
    <VStack spacing={6} align="stretch" w="full" p={2}>
      {/* Header */}
      <Stack direction={{ base: 'column', sm: 'row' }} justify="space-between" align={{ base: 'flex-start', sm: 'center' }} spacing={4} borderBottom="1px" borderColor="gray.100" pb={6} mb={2}>
        <Box>
          <Heading size="lg" fontWeight="extrabold" color="navy.600">गैलरी (Gallery)</Heading>
          <Text color="gray.500" fontSize="sm" fontWeight="medium">वेबसाइट की फोटो गैलरी को प्रबंधित करें।</Text>
        </Box>
        <Button
          onClick={onOpen}
          leftIcon={<Plus size={18} />}
          bg="navy.500"
          color="white"
          _hover={{ bg: 'navy.600' }}
          borderRadius="lg"
          px={8}
          height="45px"
          fontWeight="bold"
          fontSize="sm"
        >
          नई फोटो जोड़ें
        </Button>
      </Stack>

      <Card variant="outline" bg="white" borderRadius="3xl" p={{ base: 4, md: 8 }} borderColor="gray.100" shadow="sm">
        <CardBody p={0}>
          {loading ? (
            <HStack justify="center" py={16}><Spinner size="xl" color="navy.500" /></HStack>
          ) : (
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing={6}>
              {gallery.map((item) => (
                <Box
                  key={item._id}
                  position="relative"
                  borderRadius="2xl"
                  overflow="hidden"
                  shadow="md"
                  onMouseEnter={() => setHoveredId(item._id)}
                  onMouseLeave={() => setHoveredId(null)}
                  transition="all 0.5s ease"
                  border="1px"
                  borderColor="gray.100"
                  _hover={{ shadow: 'xl', transform: 'scale(1.02)' }}
                >
                  <AspectRatio ratio={4 / 3}>
                    <Image
                      src={`${BASE_URL}${item.image}`}
                      alt={item.title}
                      objectFit="cover"
                      transition="transform 0.7s ease"
                      transform={hoveredId === item._id ? 'scale(1.1)' : 'scale(1)'}
                    />
                  </AspectRatio>

                  {/* Hover Overlay */}
                  <Box
                    position="absolute"
                    inset={0}
                    bgGradient="linear(to-t, navy.900, transparent)"
                    display="flex"
                    flexDirection="column"
                    justifyContent="flex-end"
                    p={4}
                    opacity={hoveredId === item._id ? 1 : 0}
                    transform={hoveredId === item._id ? 'translateY(0)' : 'translateY(20px)'}
                    transition="all 0.3s ease"
                    pointerEvents="none"
                  >
                    <Text color="white" fontSize="xs" fontWeight="bold" fontFamily="hindi" lineHeight="short">
                      {item.description || item.title}
                    </Text>
                  </Box>

                  {/* Date Badge */}
                  <Badge position="absolute" top={2} left={2} bg="blackAlpha.600" color="white" fontSize="9px" px={2} backdropFilter="blur(4px)">
                    {new Date(item.createdAt).toLocaleDateString('hi-IN')}
                  </Badge>

                  {/* Action Buttons */}
                  <HStack position="absolute" top={2} right={2} spacing={1} opacity={hoveredId === item._id ? 1 : 0} transition="opacity 0.2s">
                    <IconButton
                      aria-label="Edit"
                      icon={<Pencil size={14} />}
                      size="sm"
                      bg="white"
                      color="navy.500"
                      _hover={{ bg: 'navy.50' }}
                      borderRadius="lg"
                      shadow="sm"
                      onClick={() => handleEditOpen(item)}
                    />
                    <IconButton
                      aria-label="Delete"
                      icon={uploading === item._id ? <Spinner size="xs" /> : <Trash2 size={14} />}
                      size="sm"
                      bg="white"
                      color="red.500"
                      _hover={{ bg: 'red.50' }}
                      borderRadius="lg"
                      shadow="sm"
                      isDisabled={uploading === item._id}
                      onClick={() => handleDelete(item._id)}
                    />
                  </HStack>
                </Box>
              ))}

              {/* Add New Placeholder */}
              <Box
                as="button"
                onClick={onOpen}
                border="2px"
                borderStyle="dashed"
                borderColor="navy.100"
                borderRadius="2xl"
                p={8}
                transition="all 0.2s"
                _hover={{ borderColor: 'saffron.400', bg: 'saffron.50' }}
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                aspectRatio={4 / 3}
                bg="navy.50/30"
              >
                <Box bg="white" color="navy.500" p={4} borderRadius="full" mb={4} shadow="sm">
                  <Plus size={24} />
                </Box>
                <Text fontWeight="bold" color="navy.500">नई फोटो जोड़ें</Text>
              </Box>
            </SimpleGrid>
          )}
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
        <ModalOverlay backdropFilter="blur(8px)" />
        <ModalContent borderRadius="2xl" p={2} shadow="2xl">
          <ModalHeader fontFamily="hindi" fontSize="lg" color="navy.500" pb={2}>नई फोटो अपलोड करें</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={4}>
            <VStack spacing={3} align="stretch">
              {/* File Picker */}
              <Box
                border="2px"
                borderStyle="dashed"
                borderColor={file ? 'green.300' : 'gray.200'}
                borderRadius="xl"
                p={4}
                textAlign="center"
                cursor="pointer"
                bg={file ? 'green.50' : 'gray.50'}
                _hover={{ bg: 'blue.50', borderColor: 'navy.200' }}
                transition="all 0.2s"
                onClick={() => fileRef.current.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={(e) => setFile(e.target.files[0])}
                />
                <HStack justify="center" spacing={3}>
                  <Box bg="white" color="saffron.500" p={2} borderRadius="lg" shadow="sm">
                    <UploadCloud size={22} />
                  </Box>
                  <VStack spacing={0} align="start">
                    <Text fontWeight="bold" fontSize="sm" color="navy.700">
                      {file ? file.name : 'फोटो चुनें या यहाँ ड्रैग करें'}
                    </Text>
                    <Text fontSize="xs" color="gray.500">JPG, PNG या WebP (अधिकतम 20MB)</Text>
                  </VStack>
                </HStack>
              </Box>

              {/* Title */}
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold" color="navy.500" mb={1}>शीर्षक (Title)</FormLabel>
                <Input
                  placeholder="फोटो का शीर्षक लिखें"
                  borderRadius="lg"
                  size="sm"
                  value={form.title}
                  onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                  borderColor="gray.200"
                  _focus={{ borderColor: 'navy.500' }}
                />
              </FormControl>

              {/* Description */}
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold" color="navy.500" mb={1}>होवर टेक्स्ट (Hover Text)</FormLabel>
                <Textarea
                  placeholder="फोटो पर माउस ले जाने पर दिखने वाला टेक्स्ट..."
                  borderRadius="lg"
                  rows={2}
                  size="sm"
                  bg="white"
                  borderColor="gray.200"
                  _focus={{ borderColor: 'navy.500', boxShadow: '0 0 0 1px #0D47A1' }}
                  fontFamily="hindi"
                  value={form.description}
                  onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                />
              </FormControl>

              <HStack spacing={3} pt={1}>
                <Button flex={1} variant="ghost" borderRadius="lg" size="sm" onClick={onClose} color="gray.500">रद्द करें</Button>
                <Button
                  flex={1}
                  bg="navy.500"
                  color="white"
                  borderRadius="lg"
                  size="sm"
                  _hover={{ bg: 'navy.600' }}
                  shadow="md"
                  isLoading={uploading === 'new'}
                  loadingText="अपलोड हो रहा है..."
                  onClick={handleUpload}
                >
                  फोटो सेव करें
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="md" isCentered>
        <ModalOverlay backdropFilter="blur(8px)" />
        <ModalContent borderRadius="2xl" p={2} shadow="2xl">
          <ModalHeader fontFamily="hindi" fontSize="lg" color="navy.500" pb={2}>फोटो अपडेट करें</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={4}>
            <VStack spacing={3} align="stretch">
              {/* Current Image Preview */}
              {editItem && (
                <Box borderRadius="xl" overflow="hidden" h="120px">
                  <Image
                    src={editFile ? URL.createObjectURL(editFile) : `${BASE_URL}${editItem.image}`}
                    alt={editItem.title}
                    w="full" h="full" objectFit="cover"
                  />
                </Box>
              )}

              {/* Replace Image Picker */}
              <Box
                border="2px" borderStyle="dashed"
                borderColor={editFile ? 'green.300' : 'gray.200'}
                borderRadius="xl" p={3} cursor="pointer"
                bg={editFile ? 'green.50' : 'gray.50'}
                _hover={{ bg: 'blue.50', borderColor: 'navy.200' }}
                transition="all 0.2s"
                onClick={() => editFileRef.current.click()}
              >
                <input
                  ref={editFileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={(e) => setEditFile(e.target.files[0])}
                />
                <HStack justify="center" spacing={3}>
                  <Box bg="white" color="saffron.500" p={2} borderRadius="lg" shadow="sm">
                    <UploadCloud size={18} />
                  </Box>
                  <VStack spacing={0} align="start">
                    <Text fontWeight="bold" fontSize="sm" color="navy.700">
                      {editFile ? editFile.name : 'नई फोटो बदलें (वैकल्पिक)'}
                    </Text>
                    <Text fontSize="xs" color="gray.500">JPG, PNG या WebP</Text>
                  </VStack>
                </HStack>
              </Box>

              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold" color="navy.500" mb={1}>शीर्षक</FormLabel>
                <Input
                  size="sm" borderRadius="lg" borderColor="gray.200"
                  value={editForm.title}
                  onChange={(e) => setEditForm(p => ({ ...p, title: e.target.value }))}
                  _focus={{ borderColor: 'navy.500' }}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold" color="navy.500" mb={1}>होवर टेक्स्ट</FormLabel>
                <Textarea
                  size="sm" borderRadius="lg" rows={2} borderColor="gray.200"
                  fontFamily="hindi"
                  value={editForm.description}
                  onChange={(e) => setEditForm(p => ({ ...p, description: e.target.value }))}
                  _focus={{ borderColor: 'navy.500' }}
                />
              </FormControl>

              <HStack spacing={3} pt={1}>
                <Button flex={1} variant="ghost" borderRadius="lg" size="sm" onClick={onEditClose} color="gray.500">रद्द करें</Button>
                <Button
                  flex={1} bg="navy.500" color="white" borderRadius="lg" size="sm"
                  _hover={{ bg: 'navy.600' }} shadow="md"
                  isLoading={uploading === 'edit'}
                  loadingText="सेव हो रहा है..."
                  onClick={handleUpdate}
                >
                  अपडेट सेव करें
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default Media;
