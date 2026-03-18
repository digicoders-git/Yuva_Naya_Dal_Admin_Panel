import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors: {
    navy: {
      50: '#e1e8f5',
      100: '#b4c5e3',
      200: '#84a0d1',
      300: '#547bbf',
      400: '#2d5dad',
      500: '#0d47a1', // Logo Navy
      600: '#0a3d8f',
      700: '#08327a',
      800: '#052766',
      900: '#031140',
    },
    saffron: {
      50: '#fff4e1',
      100: '#ffdfb4',
      200: '#ffc884',
      300: '#ffb154',
      400: '#ff9a2d',
      500: '#ff9933', // Logo Saffron
      600: '#e68a2e',
      700: '#cc7a29',
      800: '#b36b24',
      900: '#995c1f',
    },
    greenFlag: {
      500: '#138808',
    }
  },
  styles: {
    global: {
      body: {
        bg: '#FFFFFF', // Pure white background
        color: '#0D47A1', // Default text as Logo Navy
      },
    },
  },
  fonts: {
    heading: "'Source Sans 3', system-ui, sans-serif",
    body: "'Source Sans 3', system-ui, sans-serif",
  },
  components: {
    Heading: {
      baseStyle: {
        color: 'navy.500', // All headings in Navy
      }
    },
    Text: {
      baseStyle: {
        color: 'gray.700', // Body text a bit softer but clear
      }
    },
    Button: {
      baseStyle: {
        borderRadius: 'xl',
      },
      variants: {
        solid: {
          bg: 'navy.500',
          color: 'white',
          _hover: {
            bg: 'navy.600',
          }
        },
        outline: {
          borderColor: 'navy.500',
          color: 'navy.500',
          _hover: {
            bg: 'navy.50',
          }
        }
      }
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: '2xl',
          boxShadow: '0 4px 20px rgba(13, 71, 161, 0.08)',
          bg: 'white',
          borderWidth: '1px',
          borderColor: 'gray.100',
        }
      }
    },
    Table: {
      variants: {
        simple: {
          th: {
            color: 'navy.400',
            borderColor: 'gray.100',
            textTransform: 'none',
            fontSize: 'xs',
          },
          td: {
            borderColor: 'gray.100',
            color: 'gray.700',
          }
        }
      }
    },
    Badge: {
      baseStyle: {
        borderRadius: 'full',
        px: 3,
        py: 0.5,
      }
    }
  }
});

export default theme;
