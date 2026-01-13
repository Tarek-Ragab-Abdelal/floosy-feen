# Floosy Feen

A modern financial management application built with Next.js, featuring transaction tracking, automated streams, multi-currency support, and balance projections.

## Features

- 💰 **Transaction Management** - Track income and expenses with detailed categorization
- 🔄 **Automated Streams** - Set up recurring transactions and automated financial flows
- 💱 **Multi-Currency Support** - Handle multiple currencies with real-time exchange rates
- 📊 **Balance Projections** - Visualize future balance based on scheduled transactions
- 🏷️ **Tagging System** - Organize transactions with custom tags
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 💾 **Local Storage** - All data stored locally using IndexedDB

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: IndexedDB (via idb)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Tarek-Ragab-Abdelal/floosy-feen.git
cd floosy-feen
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:1234](http://localhost:1234) in your browser

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── automation/        # Automation management pages
│   ├── home/             # Dashboard and home page
│   ├── settings/         # Settings configuration
│   ├── transactions/     # Transaction management
│   └── welcome/          # Welcome/onboarding
├── components/           # React components
│   ├── automation/      # Automation-related components
│   ├── forms/          # Form components (transactions, streams, etc.)
│   ├── home/           # Dashboard components
│   ├── layout/         # Layout components
│   ├── transactions/   # Transaction list and filters
│   └── ui/             # Reusable UI components
├── contexts/            # React contexts
├── lib/                # Utility libraries
│   ├── calculations/   # Balance and projection calculations
│   ├── currency/       # Currency conversion utilities
│   ├── db/            # Database schema and initialization
│   └── export/        # Data export utilities
├── repositories/       # Data access layer
├── services/          # Business logic layer
└── types/            # TypeScript type definitions
```

## Deployment

This project is configured to deploy automatically to GitHub Pages using GitHub Actions.

### Automatic Deployment

Every push to the `main` branch triggers an automatic deployment:

1. The workflow builds the Next.js app as a static export
2. The build artifacts are uploaded to GitHub Pages
3. Your site is available at your configured custom domain

### Manual Deployment

To deploy manually:

```bash
npm run build
```

The static export will be generated in the `out/` directory.

## Development

### Available Scripts

- `npm run dev` - Start development server on port 1234
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Key Technologies

- **IndexedDB**: All data is stored locally in the browser
- **Exchange Rate APIs**: Fetches live currency conversion rates
- **Static Export**: Deployed as a static site to GitHub Pages

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is private and proprietary.
