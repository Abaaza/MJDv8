
# BOQ Pricer Pro - Construction CRM & Price Matching System

A comprehensive construction CRM and BOQ (Bill of Quantities) price matching system built with React, TypeScript, and Supabase. This application helps construction professionals manage clients, projects, and automatically match BOQ items with their price database using AI-powered embeddings.

## 🚀 Features

### 📊 Dashboard
- Real-time statistics overview
- Recent activity tracking
- Quick actions for common tasks
- Client and project summaries

### 👥 Client Management
- Add, edit, and manage construction clients
- Store contact information and project history
- Client-specific project tracking

### 💰 Price List Management
- Comprehensive construction price database
- Import/export price lists via CSV
- Advanced search and filtering
- Category and subcategory organization
- Support for keywords and phrases for better matching
- Bulk operations and data management

### 🤖 AI-Powered BOQ Matching
- Upload Excel/CSV BOQ files
- Automatic price matching using Cohere embeddings
- Similarity scoring and confidence metrics
- Manual price item selection and overrides
- Export matched results
- Progress tracking for large BOQs

### 📁 Project Management
- Create and manage construction projects
- Link projects to clients
- Track project status and progress

### ⚙️ Settings & Configuration
- User profile management
- Theme customization (light/dark mode)
- Notification preferences
- Admin settings for API keys and system configuration

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **AI/ML**: Cohere API for embeddings
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React
- **File Processing**: XLSX library
- **Notifications**: Sonner

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Cohere API key (for AI matching functionality)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd boq-pricer-pro
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

The application uses Supabase for backend services. You'll need to:

1. Create a Supabase project
2. Set up the database schema (see Database Setup section)
3. Configure your Supabase environment variables
4. Add your Cohere API key for AI functionality

### 4. Database Setup

The application requires several database tables:

- `profiles` - User profiles and settings
- `clients` - Client information
- `projects` - Project management
- `price_items` - Construction price database
- `ai_matching_jobs` - AI matching job tracking
- `match_results` - BOQ matching results
- `app_settings` - Application configuration

Run the included Supabase migrations to set up the schema.

### 5. API Keys Configuration

The application requires a Cohere API key for AI-powered price matching:

1. Sign up at [Cohere](https://cohere.ai/)
2. Generate an API key
3. Add it to your Supabase secrets as `COHERE_API_KEY`

### 6. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   ├── price-list/      # Price list specific components
│   └── ...
├── pages/               # Route components
├── hooks/               # Custom React hooks
├── contexts/            # React contexts
├── integrations/        # External service integrations
│   └── supabase/       # Supabase client and types
├── lib/                 # Utility functions
└── services/           # Business logic services
```

## 🔧 Key Features Explained

### Price List Management

The price list system supports:
- **Bulk Import/Export**: CSV format with comprehensive field mapping
- **Advanced Search**: Full-text search across descriptions, keywords, and phrases
- **Categorization**: Hierarchical category and subcategory system
- **Keyword System**: Up to 23 keywords per item for better matching
- **Phrase Matching**: Up to 11 phrases for contextual matching

### AI-Powered BOQ Matching

The AI matching system:
1. **Uploads BOQ files** in Excel or CSV format
2. **Preprocesses descriptions** for better matching
3. **Generates embeddings** using Cohere API
4. **Calculates similarity scores** between BOQ items and price database
5. **Combines multiple scoring methods** for optimal matching
6. **Provides manual override options** for fine-tuning

### Authentication & Security

- Supabase Auth integration
- Row-level security (RLS) policies
- Protected routes and role-based access
- Secure API key management

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Mode**: Theme switching with persistence
- **Toast Notifications**: User feedback for all actions
- **Loading States**: Progress indicators for long operations
- **Data Tables**: Sortable, filterable, and paginated tables
- **Modal Dialogs**: Intuitive forms and confirmations

## 📊 Data Management

### Price Items Schema
- Basic info: code, reference, description, category, unit, rate
- Keywords: 23 keyword fields for matching
- Phrases: 11 phrase fields for contextual matching
- Metadata: timestamps, versioning, full context

### Import/Export Formats
- **CSV Import**: Supports legacy format mapping
- **CSV Export**: Complete data export with all fields
- **Excel BOQ**: Standard BOQ format for matching

## 🔒 Security & Privacy

- All data stored securely in Supabase
- API keys stored as encrypted secrets
- User authentication required
- Row-level security for data isolation

## 🚀 Deployment

The application can be deployed on any platform that supports React apps:

1. **Lovable Platform** (recommended)
2. **Vercel/Netlify** for static hosting
3. **Custom server** with Node.js

### Environment Variables

Configure these in your deployment environment:
- Supabase URL and keys
- Cohere API key (stored in Supabase secrets)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the code comments
- Open an issue on GitHub

## 🔄 Version History

### v1.0.0
- Initial release
- Core CRM functionality
- AI-powered BOQ matching
- Price list management
- Client and project management

---

Built with ❤️ for the construction industry
