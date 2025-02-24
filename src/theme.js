import { extendTheme, createSystem, defaultConfig } from "@chakra-ui/react";

const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  colors: {
    dark: {
      900: "#0F172A",
      800: "#1E293B",
      700: "#334155",
    },
    primary: {
      500: "#3B82F6",
    },
    danger: {
      500: "#ef4444",
      600: "#dc2626",
    },
    success: {
      500: "#10b981",
    },
    warning: {
      500: "#facc15",
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "semibold",
        borderRadius: "6px",
      },
      variants: {
        primary: {
          bg: "primary.500",
          color: "white",
          _hover: { bg: "#2563EB" }
        },
        secondary: {
          bg: "dark.700",
          color: "dark.200",
          border: "1px solid",
          borderColor: "dark.600",
          _hover: {
            bg: "dark.600",
          },
        },
        danger: {
          bg: "danger.500",
          color: "white",
          _hover: {
            bg: "danger.600",
          },
        },
      },
    },
    Input: {
      baseStyle: {
        field: {
          bg: "dark.800",
          borderColor: "dark.700",
          color: "dark.200",
          _placeholder: {
            color: "dark.400",
          },
          _focus: {
            borderColor: "primary.500",
            boxShadow: "0 0 0 1px var(--chakra-colors-primary-500)",
          },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: "dark.800",
          borderRadius: "8px",
          boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
        },
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: "dark.900",
        color: "white",
      },
    },
  },
});

export const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#e6f2ff" },
          // ... outras cores
        }
      }
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: "{colors.brand.500}" },
          // ... outras variantes
        }
      }
    }
  }
});

export default theme; 