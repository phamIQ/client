# Phamiq - Crop Disease Detection Platform

## Overview

Phamiq is a comprehensive agricultural platform that provides instant crop disease detection, analysis, and treatment recommendations. Built with modern web technologies, it offers farmers and agricultural professionals a powerful tool for crop health monitoring and disease management.

## Key Features

### Smart Disease Detection
- **Powered Analysis**: Upload crop images and get instant disease diagnosis with 90%+ accuracy
- **Multi-Crop Support**: Comprehensive detection for cashew, cassava, maize, and tomato diseases
- **22 Disease Classes**: Extensive coverage of common agricultural diseases
- **Instant Results**: Get disease diagnosis and treatment recommendations in under 1 second

### Chat Assistant
- **Intelligent Conversations**: Chat about crop diseases, treatments, and agricultural advice
- **Context-Aware**: Understands your crop analysis results and provides relevant recommendations
- **Multi-Model Support**: Choose from different models (GPT-4o, Yi-Large) for various use cases
- **Chat History**: Save and review previous conversations for future reference

### Discovery & Analytics
- **Trending Diseases**: Stay updated with current disease outbreaks and trends
- **Regional Insights**: Get location-specific agricultural insights and alerts
- **Research Articles**: Access the latest agricultural research and innovations
- **Community Features**: Connect with other farmers and agricultural experts

### User Experience
- **Modern UI**: Beautiful, responsive design built with React and Tailwind CSS
- **Mobile-First**: Optimized for mobile devices with touch-friendly interface
- **Drag & Drop Upload**: Easy image upload with drag & drop functionality
- **Real-time Progress**: Track analysis progress with live updates

## Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful, accessible UI components
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Axios** - HTTP client for API communication

### Key Libraries
- **Lucide React** - Beautiful icons
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation
- **React Markdown** - Markdown rendering
- **Leaflet** - Interactive maps
- **Recharts** - Data visualization
- **Sonner** - Toast notifications

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend server running on `http://localhost:8000`

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd phamiq/client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the client directory:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Project Structure

```
client/
├── src/
│   ├── api/                    # API service layer
│   │   ├── predictionService.ts
│   │   ├── chatService.ts
│   │   ├── discoveryService.ts
│   │   └── ...
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Shadcn/ui components
│   │   ├── home/               # Homepage components
│   │   ├── upload/             # Upload-related components
│   │   └── ...
│   ├── hooks/                  # Custom React hooks
│   ├── pages/                  # Page components
│   ├── types/                  # TypeScript type definitions
│   └── lib/                    # Utility functions
├── public/                     # Static assets
├── package.json
├── vite.config.ts
└── tailwind.config.ts
```

## Configuration

### Vite Configuration
The project uses Vite with proxy configuration to forward API requests to the backend:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/chat': { target: 'http://localhost:8000' },
    '/predict': { target: 'http://localhost:8000' },
    '/auth': { target: 'http://localhost:8000' },
    // ... other API endpoints
  }
}
```

### API Services
The frontend communicates with the backend through organized service classes:
- `predictionService.ts` - Disease detection and analysis
- `chatService.ts` - Chat functionality
- `discoveryService.ts` - Discovery and analytics features
- `authService.ts` - Authentication and user management

## UI Components

### Design System
Built with Shadcn/ui components for consistency and accessibility:
- **Buttons** - Various button styles and states
- **Cards** - Content containers with shadows
- **Forms** - Form inputs with validation
- **Modals** - Dialog and modal components
- **Navigation** - Sidebar and navigation components

### Responsive Design
- Mobile-first approach
- Responsive breakpoints using Tailwind CSS
- Touch-friendly interface elements
- Adaptive layouts for different screen sizes

## Authentication

The platform supports user authentication with:
- JWT token-based authentication
- Protected routes for premium features
- User profile management
- Session persistence

## Mobile Support

- Responsive design for all screen sizes
- Touch-optimized interface
- Mobile-specific navigation
- Camera integration for direct photo capture

## Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
Set the following environment variables for production:
```env
VITE_API_URL=https://your-backend-url.com
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the documentation
- Open an issue on GitHub
- Contact the development team

---

**Phamiq** - Empowering farmers with crop disease detection and agricultural insights.