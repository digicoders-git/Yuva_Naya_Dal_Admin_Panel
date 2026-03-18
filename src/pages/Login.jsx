import { 
  Box, 
  Button, 
  FormControl, 
  FormLabel, 
  Input, 
  VStack, 
  Heading, 
  Text, 
  Flex, 
  Image, 
  InputGroup, 
  InputRightElement, 
  IconButton,
  Card,
  CardBody,
  useToast
} from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, LogIn } from 'lucide-react';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Username और Password भरें', status: 'warning', duration: 2000, isClosable: true, position: 'top' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });
      const data = await res.json();
      if (!data.success) {
        toast({ title: data.error || 'लॉगिन विफल', status: 'error', duration: 3000, isClosable: true, position: 'top' });
        return;
      }
      localStorage.setItem('admin_token', data.token);
      toast({ title: 'सफलतापूर्वक लॉगिन हुआ', status: 'success', duration: 2000, isClosable: true, position: 'top' });
      navigate('/dashboard');
    } catch {
      toast({ title: 'Server से कनेक्ट नहीं हो पाया', status: 'error', duration: 3000, isClosable: true, position: 'top' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50" p={4}>
      <Card w="full" maxW="380px" borderRadius="2xl" shadow="xl" overflow="hidden" border="1px" borderColor="gray.100">
        <CardBody p={8}>
          <VStack spacing={6} align="center">
            {/* Logo Section */}
            <VStack spacing={3}>
              <Box 
                p={0.5} 
                bgGradient="linear(to-tr, navy.500, saffron.500)" 
                borderRadius="full"
              >
                <Image 
                  src="/logo.jpeg" 
                  alt="YND Logo" 
                  boxSize="80px" 
                  borderRadius="full"
                  objectFit="cover"
                  border="3px solid white"
                />
              </Box>
              <VStack spacing={0}>
                <Heading size="md" color="navy-600" fontFamily="hindi" textAlign="center">
                  युवा न्याय दल
                </Heading>
                <Text fontSize="xs" color="saffron-500" fontWeight="bold" fontFamily="hindi" tracking="widest">
                  (अराजनैतिक)
                </Text>
              </VStack>
            </VStack>

            <Box as="form" w="full" onSubmit={handleLogin}>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={1}>यूजरनेम</FormLabel>
                  <InputGroup>
                    <Box display="flex" alignItems="center" position="absolute" left={4} zIndex={1} height="full" color="navy.300">
                      <User size={16} />
                    </Box>
                    <Input 
                      placeholder="Username" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      pl={10}
                      bg="gray.50"
                      border="none"
                      borderRadius="lg"
                      height="48px"
                      fontSize="sm"
                      _focus={{ bg: 'white', ring: 2, ringColor: 'navy.500' }}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={1}>पासवर्ड</FormLabel>
                  <InputGroup size="lg">
                    <Box display="flex" alignItems="center" position="absolute" left={4} zIndex={1} height="full" color="navy.300">
                      <Lock size={16} />
                    </Box>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      pl={10}
                      bg="gray.50"
                      border="none"
                      borderRadius="lg"
                      height="48px"
                      fontSize="sm"
                      _focus={{ bg: 'white', ring: 2, ringColor: 'navy.500' }}
                    />
                    <InputRightElement h="full" pr={1}>
                      <IconButton
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowPassword(!showPassword)}
                        icon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        _hover={{ bg: 'transparent' }}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <Button
                  type="submit"
                  bg="navy.500"
                  color="white"
                  w="full"
                  height="48px"
                  borderRadius="lg"
                  fontSize="sm"
                  fontWeight="bold"
                  leftIcon={<LogIn size={18} />}
                  _hover={{ bg: 'navy.600' }}
                  _active={{ transform: 'translateY(1px)' }}
                  isLoading={loading}
                  mt={2}
                >
                  लॉगिन करें
                </Button>
              </VStack>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </Flex>
  );
};

export default Login;
