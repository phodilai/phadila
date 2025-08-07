# Vietnamese Food Ordering System

## Overview

This is a complete Vietnamese food ordering system featuring customer ordering and administrative management. The system includes real-time push notifications using Firebase Cloud Messaging, in-memory data storage, and a dual-interface design. Built with React, Express.js, and modern UI components, it supports both takeout orders and dine-in table service with complete order lifecycle management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Notifications**: Firebase Cloud Messaging for real-time push notifications

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API with structured error handling
- **Development Setup**: Custom Vite integration for hot reloading during development
- **Logging**: Custom request/response logging middleware for API endpoints
- **Build Process**: esbuild for production bundling

### Data Architecture
- **Database**: PostgreSQL with connection pooling
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Data Storage**: In-memory storage implementation with interface for easy database migration
- **Validation**: Zod schemas for runtime type validation and API request/response validation

### Application Structure
- **Dual Interface Design**: 
  - Customer view for placing orders with drink customization (sugar/ice levels, toppings) and snack quantity selection
  - Admin view with revenue dashboard, order management, and menu item visibility controls
- **Order Management**: Complete order lifecycle (new → paid → completed → history) with status tracking and notifications
- **Menu System**: Pre-configured Vietnamese menu items with customization options for drinks (trà chanh, trà quất with aloe topping)
- **Analytics**: 7-day revenue tracking with daily breakdowns and order statistics
- **Real-time Notifications**: Firebase push notifications for new orders with automatic admin alerts

### Data Models
- **Orders**: Order tracking with customer info (name/phone/address for takeout, table number for dine-in), items with customizations, total amount, and status workflow
- **Menu Items**: Vietnamese food catalog with pricing, drink/snack categories, topping availability, and visibility controls
- **Cart System**: Client-side cart with drink customizations (sugar levels: 0-100%, ice levels: Ít/Vừa/Nhiều, aloe topping) and quantity management

### Order Flow
- **Customer Side**: Choose service type → Select table (dine-in) or enter info (takeout) → Add items to cart → Place order
- **Admin Side**: Monitor new orders → Process payments → Mark as completed → Send off customers → Manage order history
- **Notifications**: Real-time alerts when orders are placed, automatic admin tab switching for new orders

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL database provider via `@neondatabase/serverless`
- **Connection Management**: `connect-pg-simple` for session storage (prepared for future session management)

### Third-party Integrations
- **Firebase**: Cloud messaging for real-time push notifications with service worker support and VAPID key configuration
- **Replit Platform**: Development environment integration with cartographer and runtime error handling
- **Pre-configured Firebase**: Project ID pdlvt-9aae7 with messaging sender ID 373888053638 and VAPID key for push notifications

### UI and Styling
- **Radix UI**: Comprehensive set of unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide Icons**: Icon library for consistent iconography
- **Embla Carousel**: Carousel component for UI interactions

### Development Tools
- **TypeScript**: Full type safety across frontend and backend
- **Vite**: Fast build tool with hot module replacement
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer