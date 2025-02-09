# Bybit Grid Trading Dashboard

A comprehensive dashboard for managing Bybit futures grid trading bots with Fibonacci analysis.

## Features

- Real-time price monitoring
- Fibonacci-based grid calculations
- Position tracking and management
- Performance analytics
- Dark mode UI

## Tech Stack

- Frontend: Next.js with TypeScript
- UI: Tailwind CSS + shadcn/ui
- Charts: Recharts
- Backend: Express.js
- Database: SQLite
- API Integration: Bybit

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Bybit API keys

### Installation

1. Clone the repository:
```bash
git clone https://github.com/CryptoPlazaHQ/bybit-grid-dashboard.git
cd bybit-grid-dashboard
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Configure environment variables:
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001

# Backend (.env)
PORT=3001
BYBIT_API_KEY=your_api_key
BYBIT_API_SECRET=your_api_secret
```

4. Start development servers:
```bash
# Start frontend (new terminal)
cd frontend
npm run dev

# Start backend (new terminal)
cd backend
npm run dev
```

## Project Structure

```
bybit-grid-dashboard/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── public/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
