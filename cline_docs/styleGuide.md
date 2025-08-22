# Curl Feather Inc - Style Guide

## Brand Identity

### Logo
- Primary logo features a circular emblem with house icon and feather motif
- Logo components:
  - Circular frame in forest green (#005C2F)
  - Modern house icon with window detail
  - Elegant feather accent in warm tan (#B69B7D)
  - Script typography for "Curl Feather Inc"

### Color Palette

#### Primary Colors
- Forest Green: #005C2F
  - Used for primary brand elements
  - Represents professionalism and reliability
  - Main accent color for CTAs and important elements

- Warm Tan: #B69B7D
  - Secondary brand color
  - Used for accents and highlights
  - Adds warmth and sophistication

#### Supporting Colors
- Pure White: #FFFFFF
  - Primary background color
  - Creates clean, professional appearance

- Rich Black: #1A1A1A
  - Primary text color
  - Used for headings and body copy

- Light Gray: #F5F5F5
  - Secondary background color
  - Used for section differentiation

#### UI Colors
- Success Green: #34D399
- Warning Amber: #FBBF24
- Error Red: #EF4444
- Info Blue: #3B82F6

### Typography

#### Headings
- Primary: "Playfair Display" or similar serif font
  - Used for main headings
  - Reflects the elegant script in logo
```css
font-family: 'Playfair Display', serif;
```

#### Body Text
- Primary: "Inter" or similar sans-serif
  - Clean and modern
  - Excellent readability
```css
font-family: 'Inter', sans-serif;
```

### Design Elements

#### Spacing
- Base unit: 4px
- Common spacing values:
  - xs: 4px
  - sm: 8px
  - md: 16px
  - lg: 24px
  - xl: 32px
  - 2xl: 48px

#### Borders & Shadows
- Border Radius:
  - Small: 4px
  - Medium: 8px
  - Large: 12px
  - Full: 9999px (for pills/buttons)
- Shadows:
  - Light: `0 2px 4px rgba(0, 0, 0, 0.1)`
  - Medium: `0 4px 6px rgba(0, 0, 0, 0.1)`
  - Heavy: `0 8px 16px rgba(0, 0, 0, 0.1)`

#### Components

##### Buttons
```css
.btn-primary {
  background-color: #005C2F;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-secondary {
  background-color: #B69B7D;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
}
```

##### Cards
```css
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 24px;
}
```

##### Forms
```css
.input-field {
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 12px 16px;
  width: 100%;
  transition: all 0.2s;
}

.input-field:focus {
  border-color: #005C2F;
  box-shadow: 0 0 0 3px rgba(0, 92, 47, 0.1);
}
```

### Layout Guidelines

#### Grid System
- 12-column grid
- Maximum width: 1280px
- Gutters: 24px
- Breakpoints:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px

#### Section Spacing
- Vertical spacing between sections: 64px
- Section padding: 48px (top/bottom)
- Container padding: 24px (left/right)

### Imagery Guidelines

#### Photography Style
- High-quality professional images
- Natural lighting
- Focus on craftsmanship and detail
- Before/after project shots
- Clean, uncluttered compositions

#### Icons
- Line weight: 1.5px
- Rounded corners
- Consistent size (24x24px default)
- Primary color: #005C2F
- Secondary color: #B69B7D

### Animation & Transitions
- Duration: 200-300ms
- Easing: ease-in-out
- Subtle hover effects
- Smooth page transitions
- Loading states with brand colors

### Accessibility
- Minimum contrast ratio: 4.5:1
- Focus states clearly visible
- Interactive elements: 44px minimum touch target
- Semantic HTML structure
- ARIA labels where necessary

### Responsive Design
- Mobile-first approach
- Fluid typography
- Flexible grid system
- Breakpoint-specific layouts
- Touch-friendly on mobile devices

### Brand Voice
- Professional yet approachable
- Clear and concise
- Emphasis on quality and expertise
- Solution-focused messaging
- Local business personality
