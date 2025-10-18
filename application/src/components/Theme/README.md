# Animated Theme Toggle

## Overview

The Animated Theme Toggle is a visually appealing component that allows users to switch between light and dark themes with smooth animations and visual effects.

## Features

- Smooth transition animations between light and dark modes
- Animated sun and moon icons with pulsing effects
- Toggle switch with sliding animation
- Glowing effects that change based on the current theme
- Responsive design that works on all screen sizes
- Tooltips for better user experience
- Integrated into the navbar for easy access

## Implementation Details

### Components

1. **AnimatedThemeToggle.tsx** - The main component that provides the animated toggle button
2. **PublicThemeProvider.tsx** - Updated provider for public pages to support theme switching
3. **NavBar.tsx** - Updated to include the theme toggle in the navigation bar
4. **Layouts** - Modified layouts to remove standalone toggle instances

### Animations

- **Sun Rays Animation**: The sun icon pulses with a rotating animation to simulate rays
- **Moon Craters Animation**: The moon icon gently pulses to simulate craters
- **Toggle Switch Animation**: The switch slides smoothly between positions with a scaling effect
- **Background Glow**: The toggle container has a theme-appropriate glow effect
- **Icon Transitions**: Icons fade and scale when switching between modes

### Integration

The toggle is integrated into:
- Public navigation bar (visible on landing page, login, signup, etc.)
- Protected layouts still use the ThemePicker component for theme selection

## Usage

The Animated Theme Toggle is now integrated into the navbar and requires no additional setup. Users can simply click the toggle button in the top-right corner of the navbar to switch between light and dark modes.

## Customization

To customize the positioning of the toggle, you can pass props to the component:

```tsx
<AnimatedThemeToggle 
  position="relative"   // or 'absolute', 'fixed'
  top="auto"            // distance from top
  right="auto"          // distance from right
  marginTop={0}         // margin top
  marginRight={0}       // margin right
/>
```

## Technical Details

The component uses:
- Material UI's styling system with styled components
- CSS keyframes for animations
- React context for theme management
- LocalStorage for persisting user preferences
- Responsive design principles

## Testing

A basic test suite is included in `AnimatedThemeToggle.test.tsx` to ensure the component renders correctly.

## Files

- `AnimatedThemeToggle.tsx` - Main component
- `AnimatedThemeToggle.test.tsx` - Test suite
- `src/components/Public/NavBar/NavBar.tsx` - Updated to include toggle
- Layout files updated to remove standalone toggle instances
- `PublicThemeProvider.tsx` - Updated to support theme switching