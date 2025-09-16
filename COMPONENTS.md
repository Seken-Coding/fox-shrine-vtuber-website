# 🎨 Component Documentation

Complete reference for all React components in the Fox Shrine VTuber Website.

## 📋 Table of Contents

- [🎨 Component Documentation](#-component-documentation)
  - [📋 Table of Contents](#-table-of-contents)
  - [🏗️ Component Architecture](#️-component-architecture)
    - [Component Structure](#component-structure)
    - [Naming Conventions](#naming-conventions)
    - [File Organization](#file-organization)
  - [🔐 Authentication Components](#-authentication-components)
    - [AuthModal](#authmodal)
    - [PermissionGate](#permissiongate)
    - [ProtectedRoute](#protectedroute)
  - [📊 Admin Components](#-admin-components)
    - [AdminDashboard](#admindashboard)
    - [UserManagement](#usermanagement)
    - [ConfigurationPanel](#configurationpanel)
  - [🧭 Navigation Components](#-navigation-components)
    - [Navbar](#navbar)
    - [Footer](#footer)
    - [ScrollToTop](#scrolltotop)
  - [🎭 Content Components](#-content-components)
    - [HeroSection](#herosection)
    - [StreamSchedule](#streamschedule)
    - [LatestVideos](#latestvideos)
    - [MerchShowcase](#merchshowcase)
  - [🎨 UI Components](#-ui-components)
    - [LoadingFallback](#loadingfallback)
    - [ErrorBoundary](#errorboundary)
    - [SakuraPetals](#sakurapetals)
    - [FoxEasterEgg](#foxeasteregg)
  - [🔧 Utility Components](#-utility-components)
    - [SEO](#seo)
    - [PageTransition](#pagetransition)
    - [SocialShare](#socialshare)
    - [PlaceholderImages](#placeholderimages)
  - [📄 Page Components](#-page-components)
    - [HomePage](#homepage)
    - [AboutPage](#aboutpage)
    - [SetupPage](#setuppage)
    - [LoginPage](#loginpage)
  - [🎯 Component Best Practices](#-component-best-practices)
    - [Performance Optimization](#performance-optimization)
    - [Accessibility Guidelines](#accessibility-guidelines)
    - [Testing Components](#testing-components)
  - [🛠️ Custom Hooks](#️-custom-hooks)
    - [Component-Specific Hooks](#component-specific-hooks)
    - [UI State Management](#ui-state-management)

## 🏗️ Component Architecture

### Component Structure

All components follow a consistent structure:

```
ComponentName/
├── ComponentName.jsx          # Main component file
├── ComponentName.test.js      # Component tests
├── ComponentName.module.css   # Component-specific styles (if needed)
├── index.js                   # Export file
└── README.md                  # Component documentation
```

### Naming Conventions

- **Components**: PascalCase (e.g., `AuthModal`, `UserManagement`)
- **Files**: Match component name (e.g., `AuthModal.jsx`)
- **Props**: camelCase (e.g., `isVisible`, `onClose`)
- **CSS Classes**: kebab-case with BEM (e.g., `auth-modal__content`)

### File Organization

```
src/
├── components/           # Reusable components
│   ├── common/          # Shared UI components
│   ├── auth/            # Authentication components
│   ├── admin/           # Admin-specific components
│   └── content/         # Content display components
├── pages/               # Page-level components
├── hooks/               # Custom React hooks
└── utils/               # Utility functions
```

## 🔐 Authentication Components

### AuthModal

**File:** `src/components/AuthModal.jsx`

**Purpose:** Unified modal for user login and registration.

#### Props

```typescript
interface AuthModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  
  /** Function to close the modal */
  onClose: () => void;
  
  /** Initial mode - 'login' or 'register' */
  initialMode?: 'login' | 'register';
  
  /** Custom CSS class name */
  className?: string;
  
  /** Whether to show guest message */
  showGuestMessage?: boolean;
}
```

#### Usage

```jsx
import { AuthModal } from './components/AuthModal';

function App() {
  const [showAuth, setShowAuth] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowAuth(true)}>
        Login
      </button>
      
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        initialMode="login"
        showGuestMessage={true}
      />
    </>
  );
}
```

#### Features

- **Form Validation**: Real-time validation with error messages
- **Mode Switching**: Toggle between login and registration
- **Loading States**: Visual feedback during authentication
- **Error Handling**: Display authentication errors
- **Accessibility**: Keyboard navigation and screen reader support
- **Guest Message**: Encourages registration with friendly messaging

#### State Management

```jsx
const [mode, setMode] = useState(initialMode || 'login');
const [formData, setFormData] = useState({
  username: '',
  email: '',
  password: '',
  displayName: ''
});
const [errors, setErrors] = useState({});
const [isLoading, setIsLoading] = useState(false);
```

#### Validation Rules

```javascript
const validationRules = {
  username: {
    required: true,
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_]+$/
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    required: true,
    minLength: 8
  },
  displayName: {
    required: true,
    minLength: 2,
    maxLength: 50
  }
};
```

### PermissionGate

**File:** `src/hooks/useAuth.js` (exported with auth hook)

**Purpose:** Conditionally renders content based on user permissions.

#### Props

```typescript
interface PermissionGateProps {
  /** Required permission to view content */
  permission: string;
  
  /** Content to render if permission is granted */
  children: React.ReactNode;
  
  /** Whether to show "no permission" message */
  showMessage?: boolean;
  
  /** Custom message to show when access is denied */
  deniedMessage?: string;
  
  /** Fallback component to render when access is denied */
  fallback?: React.ReactNode;
}
```

#### Usage

```jsx
import { PermissionGate } from '../hooks/useAuth';

// Basic usage
<PermissionGate permission="config.write">
  <ConfigurationPanel />
</PermissionGate>

// With custom denied message
<PermissionGate 
  permission="users.read" 
  showMessage={true}
  deniedMessage="You need admin access to view this section."
>
  <UsersList />
</PermissionGate>

// With fallback component
<PermissionGate 
  permission="analytics.read"
  fallback={<div>Upgrade to VIP to view analytics</div>}
>
  <AnalyticsDashboard />
</PermissionGate>
```

### ProtectedRoute

**File:** `src/components/ProtectedRoute.jsx`

**Purpose:** Route wrapper that requires authentication or specific permissions.

#### Props

```typescript
interface ProtectedRouteProps {
  /** Component to render if access is granted */
  children: React.ReactNode;
  
  /** Required permission (if any) */
  permission?: string;
  
  /** Required role (if any) */
  role?: string;
  
  /** Whether admin access is required */
  adminOnly?: boolean;
  
  /** Redirect path for unauthorized users */
  redirectTo?: string;
  
  /** Loading component */
  loadingComponent?: React.ReactNode;
}
```

#### Usage

```jsx
import { ProtectedRoute } from './components/ProtectedRoute';

// Require authentication only
<ProtectedRoute>
  <UserProfile />
</ProtectedRoute>

// Require specific permission
<ProtectedRoute permission="config.write">
  <AdminDashboard />
</ProtectedRoute>

// Admin only route
<ProtectedRoute adminOnly redirectTo="/login">
  <SuperAdminPanel />
</ProtectedRoute>
```

## 📊 Admin Components

### AdminDashboard

**File:** `src/components/AdminDashboard.jsx`

**Purpose:** Main administrative interface for managing users and configuration.

#### Props

```typescript
interface AdminDashboardProps {
  /** Default active tab */
  defaultTab?: 'overview' | 'users' | 'config' | 'analytics';
  
  /** Custom CSS class name */
  className?: string;
}
```

#### Features

- **Tab Navigation**: Switch between different admin sections
- **Permission-Based Tabs**: Only show tabs user has access to
- **Real-time Updates**: Live data updates without page refresh
- **Responsive Design**: Works on desktop and mobile devices
- **Activity Logging**: All admin actions are logged

#### Tab Structure

```jsx
const tabs = [
  {
    id: 'overview',
    name: 'Overview',
    permission: 'analytics.read',
    component: OverviewTab
  },
  {
    id: 'users',
    name: 'Users',
    permission: 'users.read',
    component: UserManagementTab
  },
  {
    id: 'config',
    name: 'Configuration',
    permission: 'config.read',
    component: ConfigurationTab
  },
  {
    id: 'analytics',
    name: 'Analytics',
    permission: 'analytics.read',
    component: AnalyticsTab
  }
];
```

#### Usage

```jsx
import { AdminDashboard } from './components/AdminDashboard';

function AdminPage() {
  return (
    <ProtectedRoute adminOnly>
      <AdminDashboard defaultTab="overview" />
    </ProtectedRoute>
  );
}
```

### UserManagement

**File:** `src/components/admin/UserManagement.jsx`

**Purpose:** Interface for managing users, roles, and permissions.

#### Features

- **User List**: Paginated list of all users
- **Search & Filter**: Find users by username, email, or role
- **Role Management**: Change user roles with confirmation
- **Activity Monitoring**: View user activity logs
- **Bulk Actions**: Perform actions on multiple users

#### Props

```typescript
interface UserManagementProps {
  /** Initial page number */
  initialPage?: number;
  
  /** Items per page */
  pageSize?: number;
  
  /** Default sort field */
  sortBy?: 'username' | 'email' | 'createdAt' | 'lastLogin';
  
  /** Default sort order */
  sortOrder?: 'asc' | 'desc';
}
```

#### State Management

```jsx
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(true);
const [pagination, setPagination] = useState({
  currentPage: 1,
  totalPages: 1,
  totalItems: 0
});
const [filters, setFilters] = useState({
  search: '',
  role: '',
  isActive: null
});
const [selectedUsers, setSelectedUsers] = useState(new Set());
```

### ConfigurationPanel

**File:** `src/components/admin/ConfigurationPanel.jsx`

**Purpose:** Interface for managing site configuration.

#### Features

- **Section-Based Editing**: Organize config by categories
- **Real-time Preview**: See changes immediately
- **Validation**: Prevent invalid configuration values
- **Backup & Restore**: Save and restore configuration states
- **Import/Export**: Transfer configuration between environments

#### Configuration Sections

```jsx
const configSections = [
  {
    id: 'general',
    name: 'General Settings',
    fields: ['siteTitle', 'siteDescription', 'siteUrl']
  },
  {
    id: 'character',
    name: 'Character Information',
    fields: ['character.name', 'character.description', 'character.greeting']
  },
  {
    id: 'social',
    name: 'Social Media',
    fields: ['social.twitchUrl', 'social.youtubeUrl', 'social.twitterUrl']
  },
  {
    id: 'theme',
    name: 'Theme & Styling',
    fields: ['theme.primaryColor', 'theme.secondaryColor', 'theme.fontFamily']
  },
  {
    id: 'features',
    name: 'Feature Toggles',
    fields: ['features.showMerch', 'features.showDonations', 'features.showSchedule']
  }
];
```

## 🧭 Navigation Components

### Navbar

**File:** `src/components/Navbar.jsx`

**Purpose:** Main site navigation with responsive design and authentication integration.

#### Features

- **Responsive Design**: Hamburger menu on mobile
- **Authentication Integration**: Login/logout buttons
- **Dynamic Menu Items**: Show/hide based on user permissions
- **Active Route Highlighting**: Visual indication of current page
- **Accessibility**: Keyboard navigation and ARIA labels

#### Props

```typescript
interface NavbarProps {
  /** Custom CSS class name */
  className?: string;
  
  /** Whether to show the logo */
  showLogo?: boolean;
  
  /** Custom logo component */
  logo?: React.ReactNode;
  
  /** Additional menu items */
  customItems?: NavItem[];
}

interface NavItem {
  name: string;
  href: string;
  permission?: string;
  external?: boolean;
  icon?: React.ReactNode;
}
```

#### Usage

```jsx
import { Navbar } from './components/Navbar';

const customItems = [
  {
    name: 'Stream',
    href: '/stream',
    icon: <StreamIcon />
  },
  {
    name: 'Discord',
    href: 'https://discord.gg/foxshrine',
    external: true
  }
];

<Navbar 
  showLogo={true}
  customItems={customItems}
/>
```

### Footer

**File:** `src/components/Footer.jsx`

**Purpose:** Site footer with social links and information.

#### Features

- **Social Media Links**: Dynamic social media integration
- **Multi-column Layout**: Organized information sections
- **Copyright Information**: Dynamic year and site info
- **Newsletter Signup**: Email subscription form
- **Legal Links**: Privacy policy, terms of service

#### Props

```typescript
interface FooterProps {
  /** Whether to show social media links */
  showSocial?: boolean;
  
  /** Whether to show newsletter signup */
  showNewsletter?: boolean;
  
  /** Custom footer sections */
  customSections?: FooterSection[];
  
  /** Copyright text override */
  copyrightText?: string;
}
```

### ScrollToTop

**File:** `src/components/ScrollToTop.jsx`

**Purpose:** Automatically scroll to top on route changes.

#### Features

- **Route Change Detection**: Monitors route changes
- **Smooth Scrolling**: Animated scroll to top
- **Conditional Behavior**: Only scroll on certain routes
- **Performance Optimized**: Debounced scroll events

#### Props

```typescript
interface ScrollToTopProps {
  /** Routes to exclude from auto-scroll */
  excludeRoutes?: string[];
  
  /** Scroll behavior type */
  behavior?: 'auto' | 'smooth';
  
  /** Custom scroll target element */
  target?: string;
}
```

## 🎭 Content Components

### HeroSection

**File:** `src/components/HeroSection.jsx`

**Purpose:** Main landing section with character introduction.

#### Features

- **Dynamic Content**: Configuration-driven text and images
- **Animation Effects**: Fade-in and parallax animations
- **Call-to-Action Buttons**: Configurable action buttons
- **Background Effects**: Animated background elements
- **Responsive Design**: Adapts to all screen sizes

#### Props

```typescript
interface HeroSectionProps {
  /** Override hero title */
  title?: string;
  
  /** Override hero subtitle */
  subtitle?: string;
  
  /** Override character greeting */
  greeting?: string;
  
  /** Custom background image */
  backgroundImage?: string;
  
  /** Call-to-action buttons */
  ctaButtons?: CTAButton[];
  
  /** Whether to show animated effects */
  showEffects?: boolean;
}

interface CTAButton {
  text: string;
  href?: string;
  onClick?: () => void;
  variant: 'primary' | 'secondary';
  external?: boolean;
}
```

#### Configuration Integration

```jsx
const { config } = useConfig();

<HeroSection
  title={config.content.heroTitle}
  subtitle={config.content.heroSubtitle}
  greeting={config.character.greeting}
  showEffects={!config.system.maintenanceMode}
/>
```

### StreamSchedule

**File:** `src/components/StreamSchedule.jsx`

**Purpose:** Display streaming schedule and live status.

#### Features

- **Live Status Indicator**: Real-time streaming status
- **Schedule Display**: Upcoming stream times
- **Timezone Support**: Show times in user's timezone
- **Calendar Integration**: Add to calendar functionality
- **Notification Setup**: Enable stream notifications

#### Props

```typescript
interface StreamScheduleProps {
  /** Number of upcoming streams to show */
  upcomingCount?: number;
  
  /** Whether to show past streams */
  showPastStreams?: boolean;
  
  /** Custom timezone */
  timezone?: string;
  
  /** Compact view mode */
  compact?: boolean;
}
```

#### Stream Data Structure

```typescript
interface StreamEvent {
  id: string;
  title: string;
  category: string;
  scheduledFor: string; // ISO date
  duration: number; // minutes
  description?: string;
  thumbnail?: string;
  isLive?: boolean;
  platform: 'twitch' | 'youtube' | 'both';
}
```

### LatestVideos

**File:** `src/components/LatestVideos.jsx`

**Purpose:** Showcase recent video content from streaming platforms.

#### Features

- **Platform Integration**: Fetch from YouTube/Twitch APIs
- **Video Thumbnails**: High-quality preview images
- **Metadata Display**: Title, description, view count
- **Lazy Loading**: Performance-optimized loading
- **Responsive Grid**: Adaptive layout for all screens

#### Props

```typescript
interface LatestVideosProps {
  /** Number of videos to display */
  count?: number;
  
  /** Video sources to include */
  sources?: ('youtube' | 'twitch')[];
  
  /** Grid layout columns */
  columns?: number;
  
  /** Whether to autoplay on hover */
  autoplay?: boolean;
  
  /** Custom video filter function */
  filter?: (video: Video) => boolean;
}
```

### MerchShowcase

**File:** `src/components/MerchShowcase.jsx`

**Purpose:** Display merchandise and store items.

#### Features

- **Product Grid**: Responsive product display
- **Image Gallery**: Multiple product images
- **Price Display**: Dynamic pricing with currency
- **Quick View**: Modal for product details
- **Store Integration**: Links to external store

#### Props

```typescript
interface MerchShowcaseProps {
  /** Featured products to highlight */
  featuredProducts?: string[];
  
  /** Number of products to show */
  limit?: number;
  
  /** Product categories to include */
  categories?: string[];
  
  /** Store URL for "View All" link */
  storeUrl?: string;
}
```

## 🎨 UI Components

### LoadingFallback

**File:** `src/components/LoadingFallback.jsx`

**Purpose:** Consistent loading states throughout the application.

#### Features

- **Multiple Variants**: Different loading styles for different contexts
- **Customizable**: Configurable size, color, and message
- **Accessibility**: Screen reader friendly
- **Animation**: Smooth loading animations

#### Props

```typescript
interface LoadingFallbackProps {
  /** Loading variant style */
  variant?: 'spinner' | 'skeleton' | 'dots' | 'pulse';
  
  /** Size of loading indicator */
  size?: 'small' | 'medium' | 'large';
  
  /** Custom loading message */
  message?: string;
  
  /** Whether to center the loading indicator */
  centered?: boolean;
  
  /** Minimum loading time (prevents flash) */
  minLoadTime?: number;
}
```

#### Usage

```jsx
import { LoadingFallback } from './components/LoadingFallback';

// Basic usage
<LoadingFallback />

// With custom message
<LoadingFallback 
  variant="skeleton"
  message="Loading your profile..."
  size="large"
/>

// For specific components
const UserProfile = () => {
  const [loading, setLoading] = useState(true);
  
  if (loading) {
    return <LoadingFallback variant="skeleton" />;
  }
  
  return <div>Profile content...</div>;
};
```

### ErrorBoundary

**File:** `src/components/ErrorBoundary.jsx`

**Purpose:** Catch and handle JavaScript errors in component tree.

#### Features

- **Error Catching**: Prevents entire app crashes
- **Error Reporting**: Log errors for debugging
- **Fallback UI**: User-friendly error display
- **Recovery Options**: Allow users to retry
- **Development Mode**: Detailed error info in development

#### Props

```typescript
interface ErrorBoundaryProps {
  /** Child components to wrap */
  children: React.ReactNode;
  
  /** Custom fallback component */
  fallback?: React.ComponentType<ErrorFallbackProps>;
  
  /** Error reporting callback */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  
  /** Whether to show error details */
  showDetails?: boolean;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  hasError: boolean;
}
```

#### Usage

```jsx
import { ErrorBoundary } from './components/ErrorBoundary';

// Wrap entire app
<ErrorBoundary onError={logErrorToService}>
  <App />
</ErrorBoundary>

// Wrap specific sections
<ErrorBoundary 
  fallback={CustomErrorFallback}
  showDetails={process.env.NODE_ENV === 'development'}
>
  <AdminDashboard />
</ErrorBoundary>
```

### SakuraPetals

**File:** `src/components/SakuraPetals.jsx`

**Purpose:** Animated background effect with falling sakura petals.

#### Features

- **Physics Animation**: Realistic falling motion
- **Performance Optimized**: Uses CSS transforms and GPU acceleration
- **Configurable**: Adjustable speed, density, and colors
- **Responsive**: Adapts to screen size
- **Accessibility**: Respects reduced motion preferences

#### Props

```typescript
interface SakuraPetalsProps {
  /** Number of petals to render */
  count?: number;
  
  /** Animation speed multiplier */
  speed?: number;
  
  /** Petal colors */
  colors?: string[];
  
  /** Whether animation is enabled */
  enabled?: boolean;
  
  /** Z-index for layering */
  zIndex?: number;
}
```

### FoxEasterEgg

**File:** `src/components/FoxEasterEgg.jsx`

**Purpose:** Hidden interactive elements for user engagement.

#### Features

- **Click Interactions**: Special effects on specific elements
- **Sound Effects**: Audio feedback (with user permission)
- **Animation Sequences**: Fun character animations
- **Achievement System**: Unlock special content
- **Accessibility**: Keyboard activation support

#### Props

```typescript
interface FoxEasterEggProps {
  /** Trigger element selector */
  trigger?: string;
  
  /** Easter egg type */
  type?: 'sound' | 'animation' | 'modal' | 'particle';
  
  /** Activation probability (0-1) */
  probability?: number;
  
  /** Whether to track activation analytics */
  trackAnalytics?: boolean;
}
```

## 🔧 Utility Components

### SEO

**File:** `src/components/SEO.jsx`

**Purpose:** Search engine optimization and meta tag management.

#### Features

- **Dynamic Meta Tags**: Page-specific SEO optimization
- **Open Graph Support**: Social media sharing optimization
- **Twitter Cards**: Twitter-specific meta tags
- **Structured Data**: JSON-LD for rich snippets
- **Canonical URLs**: Prevent duplicate content issues

#### Props

```typescript
interface SEOProps {
  /** Page title */
  title?: string;
  
  /** Page description */
  description?: string;
  
  /** Page keywords */
  keywords?: string[];
  
  /** Canonical URL */
  canonical?: string;
  
  /** OG image URL */
  image?: string;
  
  /** Page type (website, article, etc.) */
  type?: string;
  
  /** Article-specific data */
  article?: ArticleData;
  
  /** Custom meta tags */
  meta?: MetaTag[];
}
```

#### Usage

```jsx
import { SEO } from './components/SEO';

function HomePage() {
  return (
    <>
      <SEO
        title="Fox Shrine VTuber - Welcome to the Shrine"
        description="Join the Fox Shrine for games, laughs, and magical adventures!"
        keywords={['vtuber', 'streaming', 'gaming', 'fox']}
        image="/images/og-home.jpg"
        type="website"
      />
      <HeroSection />
      {/* Page content */}
    </>
  );
}
```

### PageTransition

**File:** `src/components/PageTransition.jsx`

**Purpose:** Smooth transitions between pages and sections.

#### Features

- **Route Transitions**: Animate between page changes
- **Custom Animations**: Various transition effects
- **Loading States**: Smooth loading transitions
- **Accessibility**: Respects reduced motion preferences
- **Performance**: Hardware-accelerated animations

#### Props

```typescript
interface PageTransitionProps {
  /** Child components */
  children: React.ReactNode;
  
  /** Transition type */
  type?: 'fade' | 'slide' | 'zoom' | 'flip';
  
  /** Transition duration (ms) */
  duration?: number;
  
  /** Transition timing function */
  easing?: string;
  
  /** Whether to animate on mount */
  animateOnMount?: boolean;
}
```

### SocialShare

**File:** `src/components/SocialShare.jsx`

**Purpose:** Social media sharing buttons and functionality.

#### Features

- **Multiple Platforms**: Support for major social platforms
- **Custom Share Text**: Configurable sharing messages
- **Native Sharing**: Web Share API on supported devices
- **Analytics Tracking**: Track share events
- **Responsive Design**: Adapts to screen size

#### Props

```typescript
interface SocialShareProps {
  /** URL to share */
  url?: string;
  
  /** Text to share */
  text?: string;
  
  /** Hashtags to include */
  hashtags?: string[];
  
  /** Platforms to include */
  platforms?: SocialPlatform[];
  
  /** Button layout */
  layout?: 'horizontal' | 'vertical' | 'grid';
  
  /** Show platform labels */
  showLabels?: boolean;
}
```

### PlaceholderImages

**File:** `src/components/PlaceholderImages.jsx`

**Purpose:** Placeholder images with loading states and fallbacks.

#### Features

- **Lazy Loading**: Load images only when in viewport
- **Fallback Images**: Default images when loading fails
- **Loading States**: Skeleton loading while images load
- **Progressive Enhancement**: Show low-res first, then high-res
- **Accessibility**: Proper alt text handling

#### Props

```typescript
interface PlaceholderImageProps {
  /** Image source URL */
  src: string;
  
  /** Alt text for accessibility */
  alt: string;
  
  /** Placeholder image URL */
  placeholder?: string;
  
  /** Image dimensions */
  width?: number;
  height?: number;
  
  /** Loading strategy */
  loading?: 'lazy' | 'eager';
  
  /** Custom CSS classes */
  className?: string;
  
  /** Callback when image loads */
  onLoad?: () => void;
  
  /** Callback when image fails to load */
  onError?: () => void;
}
```

## 📄 Page Components

### HomePage

**File:** `src/pages/HomePage.jsx`

**Purpose:** Main landing page with hero section and featured content.

#### Structure

```jsx
function HomePage() {
  return (
    <PageTransition>
      <SEO 
        title="Fox Shrine VTuber"
        description="Welcome to the Fox Shrine!"
      />
      <HeroSection />
      <StreamSchedule />
      <LatestVideos />
      <MerchShowcase />
      <SakuraPetals />
    </PageTransition>
  );
}
```

### AboutPage

**File:** `src/pages/AboutPage.jsx`

**Purpose:** Character information and story page.

#### Features

- **Character Story**: Dynamic character information
- **Image Gallery**: Character artwork and photos
- **Timeline**: Character development history
- **Fan Art Section**: Community submissions
- **Contact Information**: Business and fan contact details

### SetupPage

**File:** `src/pages/SetupPage.jsx`

**Purpose:** Development-only page for initial configuration.

#### Features

- **Environment Check**: Verify development environment
- **Database Setup**: Initialize database connection
- **Configuration Test**: Test configuration loading
- **Admin Account**: Create initial admin user
- **Feature Testing**: Test major application features

#### Access Control

```jsx
function SetupPage() {
  // Only available in development
  if (process.env.NODE_ENV !== 'development') {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="setup-page">
      {/* Setup content */}
    </div>
  );
}
```

### LoginPage

**File:** `src/pages/LoginPage.jsx`

**Purpose:** Dedicated login page with authentication form.

#### Features

- **Authentication Form**: Login and registration forms
- **Social Login**: Integration with social auth providers
- **Password Recovery**: Forgot password functionality
- **Remember Me**: Persistent login option
- **Redirect Handling**: Return to intended page after login

## 🎯 Component Best Practices

### Performance Optimization

#### Memoization

```jsx
import { memo, useMemo, useCallback } from 'react';

// Memoize expensive components
const ExpensiveComponent = memo(({ data, onUpdate }) => {
  // Memoize expensive calculations
  const processedData = useMemo(() => {
    return data.map(item => complexProcessing(item));
  }, [data]);
  
  // Memoize event handlers
  const handleUpdate = useCallback((id, value) => {
    onUpdate(id, value);
  }, [onUpdate]);
  
  return (
    <div>
      {processedData.map(item => (
        <Item 
          key={item.id} 
          data={item}
          onUpdate={handleUpdate}
        />
      ))}
    </div>
  );
});
```

#### Lazy Loading

```jsx
import { lazy, Suspense } from 'react';

// Lazy load heavy components
const AdminDashboard = lazy(() => import('./AdminDashboard'));
const AnalyticsDashboard = lazy(() => import('./AnalyticsDashboard'));

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route 
          path="/admin" 
          element={<AdminDashboard />} 
        />
        <Route 
          path="/analytics" 
          element={<AnalyticsDashboard />} 
        />
      </Routes>
    </Suspense>
  );
}
```

### Accessibility Guidelines

#### ARIA Labels and Roles

```jsx
function AccessibleButton({ onClick, children, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={typeof children === 'string' ? children : undefined}
      role="button"
      tabIndex={disabled ? -1 : 0}
    >
      {children}
    </button>
  );
}
```

#### Keyboard Navigation

```jsx
function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef();
  
  useEffect(() => {
    if (isOpen) {
      // Trap focus within modal
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      firstElement.focus();
      
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
        
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      className="modal"
    >
      {children}
    </div>
  );
}
```

### Testing Components

#### Unit Tests

```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthModal } from './AuthModal';

describe('AuthModal', () => {
  test('renders login form by default', () => {
    render(
      <AuthModal 
        isOpen={true} 
        onClose={jest.fn()} 
      />
    );
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });
  
  test('switches to register form', () => {
    render(
      <AuthModal 
        isOpen={true} 
        onClose={jest.fn()} 
      />
    );
    
    fireEvent.click(screen.getByText('Create Account'));
    
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Display Name')).toBeInTheDocument();
  });
  
  test('validates form inputs', async () => {
    render(
      <AuthModal 
        isOpen={true} 
        onClose={jest.fn()} 
      />
    );
    
    const submitButton = screen.getByText('Login');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });
});
```

#### Integration Tests

```jsx
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../hooks/useAuth';
import { ConfigProvider } from '../hooks/useConfig';
import App from './App';

function TestWrapper({ children }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ConfigProvider>
          {children}
        </ConfigProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

test('renders homepage for unauthenticated user', () => {
  render(
    <TestWrapper>
      <App />
    </TestWrapper>
  );
  
  expect(screen.getByText('Welcome to the Fox Shrine')).toBeInTheDocument();
  expect(screen.getByText('Login')).toBeInTheDocument();
});
```

## 🛠️ Custom Hooks

### Component-Specific Hooks

#### useModal

```jsx
function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  
  return { isOpen, open, close, toggle };
}
```

#### useForm

```jsx
function useForm(initialValues, validationRules) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);
  
  const setFieldTouched = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);
  
  const validate = useCallback(() => {
    const newErrors = {};
    
    Object.keys(validationRules).forEach(field => {
      const rules = validationRules[field];
      const value = values[field];
      
      if (rules.required && !value) {
        newErrors[field] = `${field} is required`;
      } else if (rules.minLength && value.length < rules.minLength) {
        newErrors[field] = `${field} must be at least ${rules.minLength} characters`;
      } else if (rules.pattern && !rules.pattern.test(value)) {
        newErrors[field] = `${field} format is invalid`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validationRules]);
  
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);
  
  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validate,
    reset,
    isValid: Object.keys(errors).length === 0
  };
}
```

### UI State Management

#### useLocalStorage

```jsx
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });
  
  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);
  
  return [storedValue, setValue];
}
```

#### useDebounce

```jsx
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}
```

---

**🎨 Component Documentation Complete!**

This comprehensive guide covers all React components in the Fox Shrine VTuber website. Each component is designed with:

- **Reusability** in mind
- **Accessibility** features built-in
- **Performance** optimizations
- **Testing** capabilities
- **Documentation** for easy maintenance

For additional component support:
1. Check individual component README files
2. Review component test files for usage examples
3. Use Storybook (if available) for component development
4. Open issues for component bugs or feature requests

Happy coding! 🚀✨