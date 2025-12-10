# Zenfinity Analytics Dashboard

A comprehensive web-based analytics dashboard for visualizing battery cycle data, performance metrics, and health indicators for Zenfinity battery systems.

![Zenfinity Analytics](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF?logo=vite)

## 🚀 Features

### Core Functionality
- **Cycle Navigation**: Browse through battery cycles with intuitive sidebar navigation
- **Real-time Data**: Fetch and display live battery cycle data from API
- **Comprehensive Metrics**: View detailed statistics for each cycle including:
  - State of Charge (SOC): Average, Min, Max with visual range indicator
  - State of Health (SOH): Average, Min, Max, and SOH drop tracking
  - Voltage Metrics: Average, Minimum, Maximum voltage readings
  - Current Metrics: Average current consumption
  - Temperature Distribution: Histogram with configurable sampling rates (5°C, 10°C, 15°C, 20°C)
  - Performance Data: Speed, distance, duration, and data points
  - Charging Insights: Charging instances count and average charge start SOC

### Advanced Features
- **Dark/Light Mode**: Toggle between themes for comfortable viewing
- **Advanced Filtering**: 
  - Search by cycle number or date
  - Filter by time period (week, month, 3 months, 6 months, year)
  - Filter by cycle number range
  - Filter by cycle duration
- **Data Visualization**:
  - Temperature distribution bar charts
  - Long-term trends (SOC vs Temperature)
  - SOH/Protections trends
  - Voltage & Current trends
  - Distance & Speed charts
- **Cycle Comparison**: Compare current cycle with previous cycle
- **Anomaly Detection**: Automatic detection of unusual patterns:
  - High SOH drop warnings
  - High temperature alerts
  - Low battery health indicators
  - Protection event notifications
- **Data Export**: Export cycle data to CSV format (single cycle or all filtered cycles)
- **Keyboard Navigation**: Navigate cycles using arrow keys, Home, End, and Escape
- **Battery Health Score**: Calculated health score based on SOH, drops, warnings, and protections

## 📋 Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager
- Access to Zenfinity API endpoint

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Purav1267/Zenfinity-Analytics.git
   cd Zenfinity-Analytics
   ```

2. **Navigate to dashboard directory and install dependencies**
   ```bash
   cd zenfinity-dashboard
   npm install
   ```

3. **Configure API endpoint** (if needed)
   
   The API endpoint is configured in `vite.config.js`. By default, it proxies to:
   ```
   https://zenfinity-intern-api-104290304048.europe-west1.run.app
   ```
   
   To change the API endpoint, edit `vite.config.js`:
   ```javascript
   server: {
     proxy: {
       '/api': {
         target: 'YOUR_API_URL',
         changeOrigin: true,
         secure: false,
       },
     }
   }
   ```

4. **Configure allowed IMEIs** (if needed)
   
   Edit `src/services/api.js` to add or modify allowed IMEIs:
   ```javascript
   export const ALLOWED_IMEIS = ['865044073967657', '865044073949366'];
   ```

## 🚀 Getting Started

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Open your browser**
   
   Navigate to `http://localhost:5173` (or the port shown in terminal)

3. **Select an IMEI**
   
   Choose from the available battery IMEIs on the home page

4. **Explore the dashboard**
   - View all cycles overview or select a specific cycle
   - Use filters to narrow down cycles
   - Export data as needed

## 📦 Build for Production

```bash
npm run build
```

The production build will be created in the `dist` directory.

Preview the production build:
```bash
npm run preview
```

## 🎨 Project Structure

```
Zenfinity-Analytics/
├── zenfinity-dashboard/      # Main dashboard application
├── src/
│   ├── components/          # Reusable components
│   │   ├── KPICard.jsx     # KPI metric cards
│   │   └── TempChart.jsx   # Temperature distribution chart
│   ├── pages/               # Page components
│   │   ├── Home.jsx        # Landing page with IMEI selection
│   │   └── Dashboard.jsx   # Main dashboard with all analytics
│   ├── services/            # API services
│   │   └── api.js          # API client and configuration
│   ├── App.jsx             # Main app component with routing
│   ├── main.jsx            # Application entry point
│   └── index.css           # Global styles and theme variables
├── public/                  # Static assets
│   └── favicon.png         # Application favicon
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration with API proxy
└── tailwind.config.js      # Tailwind CSS configuration
```

## 🎯 Key Technologies

- **React 19.2.0**: Modern UI library
- **Vite 7.2.4**: Fast build tool and dev server
- **React Router 7.10.1**: Client-side routing
- **TanStack Query 5.90.12**: Data fetching and caching
- **Recharts 3.5.1**: Charting library for data visualization
- **Tailwind CSS 3.4.17**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Axios**: HTTP client for API requests

## 📊 API Endpoints

The dashboard uses the following API endpoints:

- `GET /api/snapshots?imei={imei}&limit={limit}` - Get list of cycles for an IMEI
- `GET /api/snapshots/{imei}/cycles/{cycleNumber}` - Get detailed cycle information

## ⌨️ Keyboard Shortcuts

- **Arrow Left/Up**: Navigate to previous cycle
- **Arrow Right/Down**: Navigate to next cycle
- **Home**: Jump to first cycle
- **End**: Jump to last cycle
- **Escape**: Deselect current cycle (show all cycles overview)

## 🎨 Theme Support

The dashboard supports both light and dark themes:
- Toggle button located in the top-right corner
- Theme preference is saved in localStorage
- All components are theme-aware with proper contrast

## 📈 Metrics Explained

### State of Charge (SOC)
- **Average SOC**: Mean charge level during the cycle
- **Min SOC**: Lowest charge level reached
- **Max SOC**: Highest charge level reached

### State of Health (SOH)
- **Average SOH**: Mean battery health percentage
- **SOH Drop**: Reduction in battery health during the cycle
- **Health Score**: Calculated score (0-100) based on multiple factors

### Voltage & Current
- **Voltage Range**: Min, Avg, Max voltage readings
- **Average Current**: Mean current consumption (negative = charging, positive = discharging)

### Temperature
- **Average Temperature**: Mean battery temperature
- **Distribution**: Time spent in different temperature ranges

## 🔍 Filtering Options

1. **Search**: Filter cycles by cycle number or date
2. **Time Period**: Filter by last week, month, 3 months, 6 months, or year
3. **Cycle Number Range**: Filter by minimum and maximum cycle numbers
4. **Duration Range**: Filter by cycle duration (hours)

## 📤 Data Export

- **Single Cycle Export**: Export detailed data for the selected cycle
- **Bulk Export**: Export all filtered cycles to CSV
- **CSV Format**: Includes all metrics and timestamps

## 🐛 Troubleshooting

### API Connection Issues
- Verify the API endpoint in `vite.config.js`
- Check network connectivity
- Ensure CORS is properly configured on the API server

### Build Errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version compatibility
- Verify all dependencies are installed

### Styling Issues
- Ensure Tailwind CSS is properly configured
- Check `tailwind.config.js` for correct content paths
- Verify PostCSS configuration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is private and proprietary.

## 👥 Author

**Purav Malik**
- GitHub: [@Purav1267](https://github.com/Purav1267)

## 🔗 Links

- **Repository**: [Zenfinity-Analytics](https://github.com/Purav1267/Zenfinity-Analytics.git)
- **API Endpoint**: `https://zenfinity-intern-api-104290304048.europe-west1.run.app`

## 📅 Version History

- **v1.0.0** (Current)
  - Initial release
  - Complete dashboard with all core features
  - Cycle navigation and filtering
  - Comprehensive data visualization
  - CSV export functionality
  - Dark/light mode support

---

Made with ❤️ for Zenfinity Battery Analytics
