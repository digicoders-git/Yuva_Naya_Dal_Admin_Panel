import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Stack,
  Button,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Card,
  CardBody,
  Avatar,
  Divider,
  SimpleGrid,
  InputGroup,
  InputRightElement,
  IconButton,
  Spinner,
  Flex,
  useToast,
} from '@chakra-ui/react';
import { Save, User, Lock, Eye, EyeOff, Camera, Pencil, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
});

const Center = ({ children, ...props }) => (
  <Box display="flex" justifyContent="center" alignItems="center" {...props}>
    {children}
  </Box>
);

const Settings = () => {
  const toast = useToast();

  // Profile state
  const [profile, setProfile] = useState({ name: '', username: '', email: '', profileImage: '' });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileOriginal, setProfileOriginal] = useState({});
  const [imgUploading, setImgUploading] = useState(false);
  const imgInputRef = useRef();

  // Password state
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [showPass, setShowPass] = useState({ current: false, newPass: false, confirm: false });
  const [passErrors, setPassErrors] = useState({});
  const [passSaving, setPassSaving] = useState(false);
  const [passEditing, setPassEditing] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/admin/profile`, { headers: authHeaders() });
        const data = await res.json();
        if (data.success) {
          setProfile(data.data);
          setProfileOriginal(data.data);
        }
      } catch {
        toast({ title: 'प्रोफाइल लोड नहीं हो सकी', status: 'error', duration: 3000 });
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const uploadProfileImage = async (file) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    setImgUploading(true);
    try {
      const res = await fetch(`${API_URL}/admin/profile-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setProfile(p => ({ ...p, profileImage: data.profileImage }));
        toast({ title: 'प्रोफाइल फ़ोटो अपडेट हो गई', status: 'success', duration: 3000 });
      } else {
        toast({ title: data.error || 'अपलोड विफल', status: 'error', duration: 3000 });
      }
    } catch {
      toast({ title: 'सर्वर से कनेक्ट नहीं हो सका', status: 'error', duration: 3000 });
    } finally {
      setImgUploading(false);
    }
  };

  // Save profile
  const saveProfile = async () => {
    if (!profile.name.trim()) {
      toast({ title: 'नाम खाली नहीं हो सकता', status: 'warning', duration: 3000 });
      return;
    }
    if (!profile.email.trim() || !/\S+@\S+\.\S+/.test(profile.email)) {
      toast({ title: 'सही ईमेल पता दर्ज करें', status: 'warning', duration: 3000 });
      return;
    }
    setProfileSaving(true);
    try {
      const res = await fetch(`${API_URL}/admin/profile`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
        setProfileOriginal(data.data);
        setProfileEditing(false);
        toast({ title: 'प्रोफाइल सफलतापूर्वक अपडेट हो गई', status: 'success', duration: 3000 });
      } else {
        toast({ title: data.error || 'अपडेट विफल', status: 'error', duration: 3000 });
      }
    } catch {
      toast({ title: 'सर्वर से कनेक्ट नहीं हो सका', status: 'error', duration: 3000 });
    } finally {
      setProfileSaving(false);
    }
  };

  // Change password
  const changePassword = async () => {
    const errors = {};
    if (!passwords.current) errors.current = 'वर्तमान पासवर्ड दर्ज करें';
    if (!passwords.newPass) errors.newPass = 'नया पासवर्ड दर्ज करें';
    else if (passwords.newPass.length < 8) errors.newPass = 'पासवर्ड कम से कम 8 अक्षर का होना चाहिए';
    if (!passwords.confirm) errors.confirm = 'पासवर्ड की पुष्टि करें';
    else if (passwords.newPass !== passwords.confirm) errors.confirm = 'पासवर्ड मेल नहीं खाते';

    setPassErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setPassSaving(true);
    try {
      const res = await fetch(`${API_URL}/admin/password`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.newPass }),
      });
      const data = await res.json();
      if (data.success) {
        setPasswords({ current: '', newPass: '', confirm: '' });
        setPassErrors({});
        setPassEditing(false);
        toast({ title: 'पासवर्ड सफलतापूर्वक बदल गया', status: 'success', duration: 3000 });
      } else {
        setPassErrors({ current: data.error });
      }
    } catch {
      toast({ title: 'सर्वर से कनेक्ट नहीं हो सका', status: 'error', duration: 3000 });
    } finally {
      setPassSaving(false);
    }
  };

  if (profileLoading) {
    return (
      <Flex h="80vh" w="full" align="center" justify="center">
        <Spinner size="xl" color="navy.500" thickness="4px" />
      </Flex>
    );
  }

  return (
    <VStack spacing={8} align="stretch" w="full" p={2}>
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
          <Heading size="lg" fontWeight="extrabold" color="navy.600">सेटिंग्स (Settings)</Heading>
          <Text color="gray.500" fontSize="sm" fontWeight="medium">
            अपनी प्रोफाइल और सुरक्षा सेटिंग्स को यहाँ प्रबंधित करें।
          </Text>
        </Box>
        <Button
          leftIcon={<Save size={18} />}
          bg="navy.500"
          color="white"
          borderRadius="lg"
          _hover={{ bg: 'navy.600' }}
          px={8}
          height="45px"
          fontSize="sm"
          fontWeight="bold"
          isLoading={profileSaving}
          onClick={saveProfile}
          isDisabled={!profileEditing}
        >
          सभी बदलाव सुरक्षित करें
        </Button>
      </Stack>

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={8}>
        {/* Profile Section */}
        <Card variant="outline" bg="white" borderRadius="2xl" shadow="sm" borderColor="gray.100">
          <CardBody p={8}>
            <HStack mb={8} spacing={3} justify="space-between">
              <HStack spacing={3}>
                <Box p={2} bg="navy.50" color="navy.600" borderRadius="lg">
                  <User size={20} />
                </Box>
                <Heading size="md" color="navy.600" fontFamily="hindi">एडमिन प्रोफाइल</Heading>
              </HStack>
              <IconButton
                size="sm" borderRadius="lg" variant="outline"
                icon={profileEditing ? <X size={16} /> : <Pencil size={16} />}
                colorScheme={profileEditing ? 'red' : 'navy'}
                onClick={() => {
                  if (profileEditing) {
                    setProfile(profileOriginal);
                    setProfileEditing(false);
                  } else {
                    setProfileEditing(true);
                  }
                }}
              />
            </HStack>

            <VStack spacing={6} align="stretch">
              <Center mb={4}>
                <Box position="relative" cursor={profileEditing ? 'pointer' : 'default'} onClick={() => profileEditing && imgInputRef.current.click()}>
                  <Avatar
                    size="2xl"
                    name={profile.name}
                    src={profile.profileImage ? `http://localhost:5000/${profile.profileImage}` : undefined}
                    bg="navy.500"
                    color="white"
                    border="4px"
                    borderColor="white"
                    shadow="xl"
                  />
                  <Box
                    position="absolute" bottom={0} right={0}
                    bg={imgUploading ? 'gray.400' : 'navy.500'}
                    color="white" borderRadius="full" p={1.5}
                    border="2px solid white" shadow="md"
                  >
                    {imgUploading ? <Spinner size="xs" /> : <Camera size={14} />}
                  </Box>
                  <input
                    ref={imgInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    style={{ display: 'none' }}
                    onChange={e => e.target.files[0] && uploadProfileImage(e.target.files[0])}
                  />
                </Box>
              </Center>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                    पूरा नाम
                  </FormLabel>
                  <Input
                    value={profile.name}
                    onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                    isReadOnly={!profileEditing}
                    bg={profileEditing ? 'white' : 'gray.50'}
                    border="none"
                    borderRadius="xl"
                    _focus={{ bg: 'white', ring: 1, ringColor: 'navy.500' }}
                    fontFamily="hindi"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                    यूजरनेम
                  </FormLabel>
                  <Input
                    value={profile.username}
                    onChange={e => setProfile(p => ({ ...p, username: e.target.value }))}
                    isReadOnly={!profileEditing}
                    bg={profileEditing ? 'white' : 'gray.50'}
                    border="none"
                    borderRadius="xl"
                    _focus={{ bg: 'white', ring: 1, ringColor: 'navy.500' }}
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                  ईमेल पता
                </FormLabel>
                <Input
                  value={profile.email}
                  onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                  isReadOnly={!profileEditing}
                  bg={profileEditing ? 'white' : 'gray.50'}
                  border="none"
                  borderRadius="xl"
                  _focus={{ bg: 'white', ring: 1, ringColor: 'navy.500' }}
                />
              </FormControl>

              <Button
                bg="navy.50"
                color="navy.600"
                borderRadius="xl"
                mt={2}
                _hover={{ bg: 'navy.100' }}
                fontWeight="bold"
                fontSize="sm"
                isLoading={profileSaving}
                isDisabled={!profileEditing}
                onClick={saveProfile}
              >
                प्रोफाइल अपडेट करें
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {/* Change Password Section */}
        <Card variant="outline" bg="white" borderRadius="2xl" shadow="sm" borderColor="gray.100">
          <CardBody p={8}>
            <HStack mb={8} spacing={3} justify="space-between">
              <HStack spacing={3}>
                <Box p={2} bg="orange.50" color="orange.600" borderRadius="lg">
                  <Lock size={20} />
                </Box>
                <Heading size="md" color="navy.600" fontFamily="hindi">पासवर्ड बदलें</Heading>
              </HStack>
              <IconButton
                size="sm" borderRadius="lg" variant="outline"
                icon={passEditing ? <X size={16} /> : <Pencil size={16} />}
                colorScheme={passEditing ? 'red' : 'orange'}
                onClick={() => {
                  if (passEditing) {
                    setPasswords({ current: '', newPass: '', confirm: '' });
                    setPassErrors({});
                    setPassEditing(false);
                  } else {
                    setPassEditing(true);
                  }
                }}
              />
            </HStack>

            <VStack spacing={6} align="stretch">
              <FormControl isInvalid={!!passErrors.current}>
                <FormLabel fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                  वर्तमान पासवर्ड
                </FormLabel>
                <InputGroup>
                  <Input
                    type={showPass.current ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={passwords.current}
                    onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                    isReadOnly={!passEditing}
                    bg={passEditing ? 'white' : 'gray.50'}
                    border="none"
                    borderRadius="xl"
                    _focus={{ bg: 'white', ring: 1, ringColor: 'navy.500' }}
                  />
                  <InputRightElement>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      icon={showPass.current ? <EyeOff size={16} /> : <Eye size={16} />}
                      onClick={() => setShowPass(p => ({ ...p, current: !p.current }))}
                      _hover={{ bg: 'transparent' }}
                    />
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage fontSize="xs">{passErrors.current}</FormErrorMessage>
              </FormControl>

              <Divider borderColor="gray.50" />

              <FormControl isInvalid={!!passErrors.newPass}>
                <FormLabel fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                  नया पासवर्ड
                </FormLabel>
                <InputGroup>
                  <Input
                    type={showPass.newPass ? 'text' : 'password'}
                    placeholder="कम से कम 8 अक्षर"
                    value={passwords.newPass}
                    onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))}
                    isReadOnly={!passEditing}
                    bg={passEditing ? 'white' : 'gray.50'}
                    border="none"
                    borderRadius="xl"
                    _focus={{ bg: 'white', ring: 1, ringColor: 'navy.500' }}
                  />
                  <InputRightElement>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      icon={showPass.newPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      onClick={() => setShowPass(p => ({ ...p, newPass: !p.newPass }))}
                      _hover={{ bg: 'transparent' }}
                    />
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage fontSize="xs">{passErrors.newPass}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!passErrors.confirm}>
                <FormLabel fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                  नए पासवर्ड की पुष्टि करें
                </FormLabel>
                <InputGroup>
                  <Input
                    type={showPass.confirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={passwords.confirm}
                    onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                    isReadOnly={!passEditing}
                    bg={passEditing ? 'white' : 'gray.50'}
                    border="none"
                    borderRadius="xl"
                    _focus={{ bg: 'white', ring: 1, ringColor: 'navy.500' }}
                  />
                  <InputRightElement>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      icon={showPass.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      onClick={() => setShowPass(p => ({ ...p, confirm: !p.confirm }))}
                      _hover={{ bg: 'transparent' }}
                    />
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage fontSize="xs">{passErrors.confirm}</FormErrorMessage>
              </FormControl>

              <Box p={4} bg="orange.50" borderRadius="xl" border="1px" borderColor="orange.100">
                <Text fontSize="xs" color="orange.700" fontWeight="medium">
                  सुरक्षा सुझाव: अपने पासवर्ड में अक्षरों, नंबरों और विशेष प्रतीकों (!@#$) का उपयोग करें।
                </Text>
              </Box>

              <Button
                colorScheme="orange"
                borderRadius="xl"
                mt={2}
                fontWeight="bold"
                fontSize="sm"
                shadow="md"
                isLoading={passSaving}
                isDisabled={!passEditing}
                onClick={changePassword}
              >
                पासवर्ड अपडेट करें
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>
    </VStack>
  );
};

export default Settings;
