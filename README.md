# Bus Line Tracker 

An interactive web application for tracking and visualizing bus routes in real-time. Built with Next.js, React, and Leaflet.

## Features 

### Core Functionality
- **Real-time Bus Tracking**: View bus stops and lines on an interactive map
- **Route Visualization**: Display complete bus routes with smooth polylines
- **Interactive Selection**: Click on bus stops to see available lines
- **Automatic Map Navigation**: Smart zooming to show entire routes
- **Location Services**: 
  - Automatic user location detection
  - Smart fallback to default location (Madrid center)
  - Permission handling with clear user guidance
  - Easy location refresh option

### Technical Highlights
- Built with Next.js and TypeScript for robust performance
- Integrated with CTAN API for real-time bus data
- Efficient route data caching system
- Responsive and mobile-friendly design
- Geolocation API integration with permissions handling

### User Experience
- Clean and intuitive interface
- Smooth animations and transitions
- Quick access to bus line information
- Error handling with user-friendly messages
- Clear location permission requests
- Informative location status notifications

## Getting Started 

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Modern browser with geolocation support

### Installation
1. Clone the repository:
```bash
git clone https://github.com/yourusername/bus-tracker.git
cd bus-tracker
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage 

1. **View Bus Stops**
   - Open the application to see nearby bus stops on the map
   - Your location is automatically detected and displayed

2. **Find Bus Lines**
   - Click on any bus stop marker
   - View available bus lines in the popup

3. **View Routes**
   - Click on a bus line number
   - The complete route will be displayed on the map
   - Map automatically adjusts to show the entire route

## Technical Details 

### Map Features
- Interactive map with Leaflet integration
- Custom markers for bus stops and user location
- Smooth polyline rendering for routes
- Automatic bounds fitting for optimal viewing

### Performance Optimizations
- Route data caching to minimize API calls
- Efficient coordinate parsing
- Optimized marker and popup interactions
- Proper resource cleanup and lifecycle management

### UI Components
- Styled bus line buttons with hover effects
- Responsive popup layouts
- Smooth transition animations
- Error handling notifications

## Contributing 

Contributions are welcome! Please feel free to submit a Pull Request.

## License 

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 

- CTAN API for providing real-time bus data
- Leaflet for the amazing mapping capabilities
- Next.js team for the excellent framework
