# FlightTracker

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Java 17](https://img.shields.io/badge/Java%2017-ED8B00?style=for-the-badge&logo=java&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![REST API](https://img.shields.io/badge/REST%20API-47C5FB?style=for-the-badge)
![Clean Architecture](https://img.shields.io/badge/Clean%20Architecture-Best%20Practices-blueviolet?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

**A comprehensive REST API for simulating airline flight operations. Features dynamic pricing, real-time seat management, booking system, and intelligent check-in algorithms.**

---

## 🎯 Project Overview

FlightTracker is a backend REST API that simulates real-world airline operations including:
- Flight scheduling and management
- Dynamic pricing algorithms
- Real-time seat inventory
- Passenger booking & cancellation
- Check-in process automation
- Layover/connection management

Built with **Spring Boot 3** and **Java 17**, demonstrating enterprise patterns and clean architecture principles.

---

## ✨ Core Features

### Flight Management
- ✅ Create and schedule flights
- ✅ Define routes with layovers
- ✅ Aircraft assignment with seat configurations
- ✅ Flight status tracking
- ✅ Cancellation & rescheduling

### Pricing Engine
- ✅ Base fare calculation
- ✅ Dynamic pricing based on:
  - Demand (seat availability)
  - Booking time (early bird discounts)
  - Seat class (economy, business, first)
  - Seasonal multipliers
- ✅ Price history tracking

### Booking System
- ✅ Search flights by route & date
- ✅ Reserve seats (with validation)
- ✅ Modify bookings
- ✅ Cancel with refund calculation
- ✅ Booking confirmation & ticket generation

### Seat Management
- ✅ Real-time seat availability
- ✅ Seat class distribution
- ✅ Accessible seat tracking
- ✅ Seat hold (temporary reservation)
- ✅ Seat release on cancellation

### Check-in Process
- ✅ Online check-in (24hrs before)
- ✅ Baggage assignment
- ✅ Seat confirmation
- ✅ Boarding group assignment
- ✅ Check-in validation

### Passenger Management
- ✅ Passenger profile
- ✅ Frequent flyer tracking
- ✅ Special requests (wheelchair, meal)
- ✅ Travel document validation
- ✅ Loyalty points

---

## 🏗️ Architecture

### Layered Architecture

```
┌─────────────────────────────┐
│      REST Controllers       │  API Endpoints
├─────────────────────────────┤
│      Service Layer          │  Business Logic
├─────────────────────────────┤
│      Repository Layer       │  Data Access
├─────────────────────────────┤
│     Database (JPA)          │  PostgreSQL
└─────────────────────────────┘
```

### Key Components

```
com.flighttracker/
├── api/
│   ├── controller/
│   │   ├── FlightController.java
│   │   ├── BookingController.java
│   │   ├── CheckInController.java
│   │   └── PassengerController.java
│   ├── dto/
│   │   ├── FlightDTO.java
│   │   ├── BookingRequest.java
│   │   └── PriceDTO.java
│   └── exception/
│       └── GlobalExceptionHandler.java
├── service/
│   ├── FlightService.java
│   ├── PricingService.java
│   ├── BookingService.java
│   ├── CheckInService.java
│   └── SeatAvailabilityService.java
├── repository/
│   ├── FlightRepository.java
│   ├── BookingRepository.java
│   ├── PassengerRepository.java
│   └── SeatRepository.java
├── entity/
│   ├── Flight.java
│   ├── Booking.java
│   ├── Passenger.java
│   ├── Seat.java
│   └── CheckIn.java
└── config/
    └── AppConfig.java
```

---

## 🗄️ Database Schema

### Core Tables

```sql
-- Airlines & Aircraft
CREATE TABLE airlines (
    id UUID PRIMARY KEY,
    code VARCHAR(3),
    name VARCHAR(100)
);

CREATE TABLE aircraft (
    id UUID PRIMARY KEY,
    airline_id UUID REFERENCES airlines(id),
    model VARCHAR(50),
    registration VARCHAR(10),
    economy_seats INT,
    business_seats INT,
    first_class_seats INT
);

-- Routes & Flights
CREATE TABLE airports (
    id UUID PRIMARY KEY,
    code VARCHAR(3) UNIQUE,
    name VARCHAR(100),
    city VARCHAR(50)
);

CREATE TABLE routes (
    id UUID PRIMARY KEY,
    origin_id UUID REFERENCES airports(id),
    destination_id UUID REFERENCES airports(id),
    distance_km INT
);

CREATE TABLE flights (
    id UUID PRIMARY KEY,
    route_id UUID REFERENCES routes(id),
    aircraft_id UUID REFERENCES aircraft(id),
    departure_time TIMESTAMP,
    arrival_time TIMESTAMP,
    status VARCHAR(50),  -- SCHEDULED, BOARDING, DEPARTED, LANDED
    base_fare DECIMAL(10,2)
);

-- Seats & Availability
CREATE TABLE seats (
    id UUID PRIMARY KEY,
    aircraft_id UUID REFERENCES aircraft(id),
    seat_number VARCHAR(10),
    seat_class VARCHAR(50),  -- ECONOMY, BUSINESS, FIRST
    is_accessible BOOLEAN,
    UNIQUE(aircraft_id, seat_number)
);

CREATE TABLE seat_inventory (
    id UUID PRIMARY KEY,
    flight_id UUID REFERENCES flights(id),
    seat_id UUID REFERENCES seats(id),
    status VARCHAR(50),  -- AVAILABLE, BOOKED, HELD
    held_until TIMESTAMP,
    UNIQUE(flight_id, seat_id)
);

-- Pricing
CREATE TABLE flight_prices (
    id UUID PRIMARY KEY,
    flight_id UUID REFERENCES flights(id),
    seat_class VARCHAR(50),
    base_price DECIMAL(10,2),
    current_price DECIMAL(10,2),
    demand_multiplier DECIMAL(3,2),
    updated_at TIMESTAMP
);

-- Passengers & Bookings
CREATE TABLE passengers (
    id UUID PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    passport_number VARCHAR(50),
    frequent_flyer_number VARCHAR(50)
);

CREATE TABLE bookings (
    id UUID PRIMARY KEY,
    flight_id UUID REFERENCES flights(id),
    booking_reference VARCHAR(10) UNIQUE,
    passenger_id UUID REFERENCES passengers(id),
    seat_id UUID REFERENCES seats(id),
    booking_date TIMESTAMP,
    status VARCHAR(50),  -- CONFIRMED, CANCELLED
    price_paid DECIMAL(10,2)
);

-- Check-in
CREATE TABLE check_ins (
    id UUID PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id),
    check_in_time TIMESTAMP,
    gate_number VARCHAR(10),
    boarding_group VARCHAR(5),
    baggage_tags TEXT[]
);
```

---

## 📚 API Endpoints

### Flights

```http
POST /api/v1/flights
Content-Type: application/json

{
  "routeId": "uuid",
  "aircraftId": "uuid",
  "departureTime": "2024-01-15T10:00:00Z",
  "arrivalTime": "2024-01-15T14:30:00Z",
  "baseFare": 250.00
}

GET /api/v1/flights
GET /api/v1/flights/{flightId}

GET /api/v1/flights/search?origin=JFK&destination=LAX&date=2024-01-15
```

### Pricing

```http
GET /api/v1/flights/{flightId}/prices

GET /api/v1/flights/{flightId}/prices/{seatClass}

Response:
{
  "baseFare": 250.00,
  "currentPrice": 320.50,
  "demandMultiplier": 1.28,
  "availableSeats": 25,
  "lastUpdated": "2024-01-10T14:22:00Z"
}
```

### Booking

```http
POST /api/v1/bookings
{
  "flightId": "uuid",
  "passengerId": "uuid",
  "seatId": "uuid",
  "pricePaid": 320.50
}

Response: 201
{
  "bookingId": "uuid",
  "bookingReference": "AB12CD",
  "status": "CONFIRMED",
  "seat": "12A",
  "passenger": { ... }
}

PUT /api/v1/bookings/{bookingId}
DELETE /api/v1/bookings/{bookingId}
```

### Check-in

```http
POST /api/v1/check-in
{
  "bookingReference": "AB12CD",
  "passportNumber": "XX123456"
}

Response:
{
  "boardingPass": {
    "flightNumber": "AA100",
    "seat": "12A",
    "boardingGroup": "B",
    "gate": "A12",
    "boardingTime": "2024-01-15T09:15:00Z"
  }
}

GET /api/v1/check-in/{bookingReference}
```

---

## 💰 Pricing Algorithm

```java
public class PricingEngine {
    
    // Dynamic price = Base fare × Demand multiplier × Time multiplier
    public BigDecimal calculatePrice(Flight flight, String seatClass) {
        BigDecimal baseFare = flight.getBaseFare();
        
        // Demand multiplier (0.7 to 2.0)
        // High demand = fewer seats available = higher price
        double demandMultiplier = calculateDemandMultiplier(flight);
        
        // Time multiplier (early booking discount)
        // More days until flight = lower price
        double timeMultiplier = calculateTimeMultiplier(flight);
        
        // Seat class surcharge
        double classMultiplier = getSeatClassMultiplier(seatClass);
        
        return baseFare
            .multiply(new BigDecimal(demandMultiplier))
            .multiply(new BigDecimal(timeMultiplier))
            .multiply(new BigDecimal(classMultiplier));
    }
}
```

---

## ✈️ Check-in Algorithm

```
1. Validate booking & passenger
2. Check 24-hour rule (< 24hrs to departure)
3. Assign boarding group based on:
   - Frequent flyer status
   - Seat class
   - Check-in order
4. Assign gate (depends on destination distance)
5. Generate baggage tags
6. Issue boarding pass
7. Return to passenger
```

---

## 🧪 Testing

```bash
# Unit tests
mvn test

# Integration tests
mvn test -Dtest=*IntegrationTest

# Test coverage
mvn jacoco:report

# Load testing (if included)
mvn jmeter:gui
```

---

## 🚀 Running

```bash
mvn clean install
mvn spring-boot:run

# API: http://localhost:8080
# Swagger: http://localhost:8080/swagger-ui.html
```

---

## 📊 Performance

- Optimized queries with proper indexing
- Seat availability cached in-memory
- Price calculations memoized
- Connection pooling with HikariCP

---

## 🔮 Future Enhancements

- [ ] Multi-leg journey bookings
- [ ] Ancillary services (meals, bags)
- [ ] Crew management
- [ ] Overbooking simulation
- [ ] Revenue optimization
- [ ] Mobile boarding pass
- [ ] Payment gateway integration

---

**Built with ❤️ by Berat Zengin**
