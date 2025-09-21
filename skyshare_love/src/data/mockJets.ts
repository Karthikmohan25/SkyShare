export interface Jet {
  id: string;
  name: string;
  model: string;
  location: string;
  image: string;
  rentalYield: number;
  projectedReturn: number;
  availableTokens: number;
  tokenPrice: number;
  totalTokens: number;
  description: string;
  specifications: {
    maxPassengers: number;
    range: string;
    maxSpeed: string;
    yearBuilt: number;
  };
  features: string[];
}

export const mockJets: Jet[] = [
  {
    id: "1",
    name: "Sky Elite N789JE",
    model: "Gulfstream G650",
    location: "Los Angeles, CA",
    image: "/placeholder.svg",
    rentalYield: 15.3,
    projectedReturn: 18.7,
    availableTokens: 2500,
    tokenPrice: 125,
    totalTokens: 10000,
    description: "Ultra-long-range business jet with exceptional performance and luxury amenities.",
    specifications: {
      maxPassengers: 14,
      range: "7,000 nm",
      maxSpeed: "Mach 0.925",
      yearBuilt: 2020
    },
    features: ["WiFi", "Full Kitchen", "Bedroom", "Conference Room", "Entertainment System"]
  },
  {
    id: "2", 
    name: "Azure Wings N456AZ",
    model: "Bombardier Global 7500",
    location: "Miami, FL",
    image: "/placeholder.svg",
    rentalYield: 12.8,
    projectedReturn: 16.2,
    availableTokens: 3200,
    tokenPrice: 98,
    totalTokens: 8000,
    description: "The world's largest and longest-range business jet with four living spaces.",
    specifications: {
      maxPassengers: 17,
      range: "7,700 nm",
      maxSpeed: "Mach 0.925",
      yearBuilt: 2019
    },
    features: ["Four Living Spaces", "Master Suite", "Full Kitchen", "WiFi", "Satellite Phone"]
  },
  {
    id: "3",
    name: "Platinum Flyer N123PF",
    model: "Cessna Citation X+",
    location: "New York, NY", 
    image: "/placeholder.svg",
    rentalYield: 18.5,
    projectedReturn: 22.1,
    availableTokens: 1800,
    tokenPrice: 85,
    totalTokens: 6000,
    description: "Fastest civilian aircraft with cutting-edge avionics and luxurious interior.",
    specifications: {
      maxPassengers: 9,
      range: "3,460 nm",
      maxSpeed: "Mach 0.935",
      yearBuilt: 2021
    },
    features: ["Fastest Civilian Aircraft", "Garmin G5000", "WiFi", "Refreshment Center"]
  },
  {
    id: "4",
    name: "Royal Voyager N890RV",
    model: "Embraer Praetor 600",
    location: "Dallas, TX",
    image: "/placeholder.svg",
    rentalYield: 14.2,
    projectedReturn: 17.8,
    availableTokens: 2100,
    tokenPrice: 75,
    totalTokens: 7500,
    description: "Super-midsize jet with best-in-class comfort and advanced technology.",
    specifications: {
      maxPassengers: 12,
      range: "4,018 nm",
      maxSpeed: "Mach 0.83",
      yearBuilt: 2020
    },
    features: ["Full Flat-Floor Cabin", "Ka-Band WiFi", "Wet Bar", "Baggage Compartment"]
  },
  {
    id: "5",
    name: "Diamond Sky N567DS",
    model: "Dassault Falcon 7X",
    location: "San Francisco, CA",
    image: "/placeholder.svg",
    rentalYield: 13.7,
    projectedReturn: 16.9,
    availableTokens: 2800,
    tokenPrice: 110,
    totalTokens: 9000,
    description: "Tri-engine long-range business jet with exceptional fuel efficiency.",
    specifications: {
      maxPassengers: 14,
      range: "5,950 nm",
      maxSpeed: "Mach 0.90",
      yearBuilt: 2018
    },
    features: ["Tri-Engine Design", "Advanced Flight Controls", "Spacious Cabin", "WiFi"]
  },
  {
    id: "6",
    name: "Elite Navigator N234EN",
    model: "Gulfstream G280",
    location: "Chicago, IL",
    image: "/placeholder.svg",
    rentalYield: 16.1,
    projectedReturn: 19.5,
    availableTokens: 1950,
    tokenPrice: 68,
    totalTokens: 5500,
    description: "Super-midsize jet combining performance, comfort, and efficiency.",
    specifications: {
      maxPassengers: 10,
      range: "3,600 nm", 
      maxSpeed: "Mach 0.85",
      yearBuilt: 2021
    },
    features: ["PlaneView Cockpit", "100% Fresh Air System", "WiFi", "Galley"]
  },
  {
    id: "7",
    name: "Phoenix Rising N345PR",
    model: "Bombardier Challenger 350",
    location: "Las Vegas, NV",
    image: "/placeholder.svg",
    rentalYield: 17.3,
    projectedReturn: 20.8,
    availableTokens: 1600,
    tokenPrice: 92,
    totalTokens: 4800,
    description: "Super-midsize business jet with wide cabin and smooth ride technology.",
    specifications: {
      maxPassengers: 10,
      range: "3,200 nm",
      maxSpeed: "Mach 0.83",
      yearBuilt: 2019
    },
    features: ["Wide Cabin", "Smooth Ride Technology", "WiFi", "Full Galley", "Lavatory"]
  },
  {
    id: "8",
    name: "Sovereign Air N678SA",
    model: "Cessna Citation Sovereign+",
    location: "Seattle, WA",
    image: "/placeholder.svg", 
    rentalYield: 11.9,
    projectedReturn: 15.4,
    availableTokens: 2400,
    tokenPrice: 58,
    totalTokens: 6200,
    description: "Midsize jet with excellent performance and operating economics.",
    specifications: {
      maxPassengers: 9,
      range: "3,000 nm",
      maxSpeed: "Mach 0.75",
      yearBuilt: 2020
    },
    features: ["Garmin G5000", "WiFi", "Refreshment Center", "Large Baggage Area"]
  }
];