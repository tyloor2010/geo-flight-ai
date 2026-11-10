# AeroPlanner AI

Build a complete, polished, competition-ready web platform called DroneRoute AI.

The project is an intelligent drone mission planning and route optimization platform designed for the ITC competition.

The goal is NOT to create a generic drone dashboard.

The goal is to demonstrate how AI, geospatial mapping, route optimization, battery estimation, mission planning, and safety constraints can work together to automatically generate an efficient and safe drone flight mission.

The website must feel like a real professional aerospace/drone operations platform that could eventually connect to a real drone, while the current version works as a highly realistic simulation/prototype.

1. CORE CONCEPT

DroneRoute AI allows an operator to:

Open an interactive map.

Select or draw an area that needs to be surveyed.

Define the drone and mission parameters.

Add restricted/no-fly zones.

Add obstacles or points of interest.

Let the AI calculate the optimal flight route.

Automatically generate a complete flight path.

Estimate mission distance, duration, battery consumption, coverage, and risk.

Simulate the drone moving along the generated route.

Monitor the mission in real time.

Pause, resume, or abort the simulated mission.

Review the mission after completion.

The key innovation is:

The operator defines WHAT needs to be covered.
DroneRoute AI determines HOW the drone should fly.

2. DESIGN DIRECTION

Create a premium, futuristic aerospace / command-center interface.

Do NOT make it look like a generic SaaS template.

Visual direction:

Dark professional interface.

Aerospace / military-inspired command center aesthetic.

Deep charcoal / black background.

Subtle glass panels.

Clean white typography.

Controlled cyan/blue accents.

Small amounts of green/yellow/red for system status.

Thin borders.

Soft shadows.

Minimal rounded corners.

Dense but organized information.

Professional data visualization.

High-quality micro-interactions.

Smooth map animations.

Subtle grid patterns.

Professional technical typography.

The interface should feel inspired by:

Drone Ground Control Stations

Aerospace mission-control software

Modern defense technology dashboards

Professional GIS systems

Autonomous robotics interfaces

Avoid excessive neon, gaming aesthetics, cartoon graphics, or unnecessary gradients.

The product should look credible enough that an ITC judge could imagine it becoming a real product.

3. BRANDING

Product name:

DroneRoute AI

Tagline:

"Plan Smarter. Fly Safer. Cover More."

Alternative supporting statement:

AI-Powered Autonomous Drone Mission Planning

Create a simple professional logo combining:

Drone / aircraft concept

Route/path concept

Location/map concept

The logo should be minimal and suitable for both the website and presentation slides.

4. MAIN APPLICATION STRUCTURE

Create the following main sections:

A. Mission Control

B. Mission Planner

C. Live Mission

D. Mission History

E. Analytics

F. Drone Fleet

G. Settings

The most important screen is Mission Planner.

5. LANDING / INTRO SCREEN

Create a professional landing page before entering the dashboard.

Hero section:

DroneRoute AI

AI-Powered Drone Mission Planning

"Turn a survey area into an optimized autonomous flight mission."

Primary CTA:

Launch Mission Planner

Secondary CTA:

Explore Demo

Include an animated conceptual drone flight path moving across a subtle map/grid background.

Show three key capabilities:

AI Route Optimization

Automatically calculate efficient flight paths.

Safety-Aware Planning

Respect restricted zones, obstacles, and operational limits.

Mission Intelligence

Estimate coverage, battery, time, distance, and mission risk.

Include a short "How it works" section:

Define Area

Configure Drone

Set Constraints

Generate Route

Simulate Mission

Analyze Results

6. MISSION PLANNER

This is the most important page.

Layout:

LEFT SIDEBAR

Mission configuration.

CENTER

Large interactive map.

RIGHT SIDEBAR

Mission intelligence and generated results.

TOP BAR

Mission name, connection status, battery, GPS status, and Generate Mission button.

7. INTERACTIVE MAP

Use a real interactive map library such as Mapbox GL JS, Leaflet, or another suitable mapping solution.

The map must be highly interactive.

Support:

Zoom

Pan

Satellite view

Standard map view

Terrain-style view if available

Search location

Draw polygon

Draw rectangle

Add marker

Add restricted zone

Add obstacle

Clear mission

The user should be able to draw a polygon representing the area that needs to be surveyed.

Example:

The user draws:

Survey Area A

The platform calculates:

Area size

Approximate perimeter

Coverage requirements

8. MISSION AREA

When the user draws an area, show:

Mission Area

Area: 2.84 km²

Perimeter: 7.1 km

Estimated coverage: 94%

Survey pattern: Adaptive Grid

Do NOT hard-code these values.

Calculate them dynamically based on the drawn geometry where possible.

9. NO-FLY / RESTRICTED ZONES

Allow the operator to create restricted zones.

The user can draw a polygon or circle and label it:

No-Fly Zone

Restricted Area

Obstacle

Sensitive Area

Display restricted areas clearly on the map.

The generated route must NEVER pass through restricted zones.

Show a warning if the user creates a mission area where safe routing is impossible.

Example:

⚠ ROUTE CONFLICT

"The selected survey area contains restricted airspace."

Then provide:

Recalculate Safe Route

10. DRONE CONFIGURATION

Create a Drone Configuration panel.

Fields:

Drone Model:

Surveyor X1

Surveyor X2

Custom Drone

Battery Capacity:

5000 mAh

10000 mAh

15000 mAh

Custom

Starting Battery:

100%

Cruising Speed:

8 m/s

Maximum Flight Time:

25 min

Camera Type:

RGB

Thermal

Multispectral

Payload:

None

Camera

Sensor Package

The system should use these values to calculate mission estimates.

11. MISSION OBJECTIVE

Allow the operator to select the mission type:

Area Survey

Maximum coverage of a selected region.

Mapping

Generate systematic overlapping flight lines.

Inspection

Focus on specific structures/points.

Search

Prioritize complete area coverage.

Custom

Operator-defined mission.

Changing the mission type should change the route-planning strategy.

12. FLIGHT PARAMETERS

Allow configuration of:

Altitude:
20m – 120m

Cruising Speed:
1–20 m/s

Camera Field of View

Image Overlap:
60% – 90%

Side Overlap:
40% – 80%

Return-to-Home Battery:
20% default

Safety Battery Reserve:
15% default

Wind Condition:
Low / Moderate / High

13. AI ROUTE OPTIMIZATION

Create a powerful "AI Route Engine".

When the user clicks:

GENERATE AI MISSION

show an impressive animated process.

Example:

Analyzing mission area...

Detecting restricted zones...

Calculating coverage grid...

Evaluating possible flight paths...

Optimizing route distance...

Estimating battery consumption...

Checking return-to-home feasibility...

Running safety validation...

Mission optimized.

Then display:

MISSION READY

The system should generate a realistic flight path on the map.

14. ROUTE ALGORITHM

Implement a realistic route-planning simulation.

The route should consider:

Survey area geometry

Drone starting position

Restricted zones

Obstacles

Drone speed

Required image overlap

Battery capacity

Safety reserve

Return-to-home requirements

Total route distance

Coverage percentage

For area surveys, use an efficient lawnmower / boustrophedon-style coverage pattern where appropriate.

Do not simply draw a random line.

The route should visibly make sense.

If obstacles or restricted areas exist, the route must adapt around them.

15. MISSION INTELLIGENCE PANEL

After route generation, display:

Mission Summary

Mission Status
Ready

Route Distance
8.42 km

Estimated Flight Time
18m 42s

Estimated Battery Usage
68%

Expected Remaining Battery
32%

Coverage
96.4%

Safety Margin
18%

Risk Level
LOW

Waypoints
84

Estimated Images
426

These values should be dynamically generated from the selected mission configuration.

16. AI MISSION SCORE

Create a large visual score:

Mission Efficiency

92 / 100

Break it down into:

Route Efficiency — 94%
Battery Efficiency — 88%
Coverage — 97%
Safety — 95%

Use professional charts / progress indicators.

Add a button:

Why this score?

Opening it should explain:

"Route was optimized to reduce unnecessary travel while maintaining required survey coverage and battery reserve."

17. ROUTE ALTERNATIVES

This is an important feature.

After generating the route, show:

AI Recommended Route

92 Efficiency

Shortest Route

88 Efficiency

Maximum Coverage

86 Efficiency

Maximum Safety

90 Efficiency

Allow the user to compare them.

When clicking an alternative, display its path on the map.

Explain the tradeoffs.

Example:

AI Recommended
Best balance between coverage, battery usage, and safety.

Shortest
Lowest distance but slightly lower survey coverage.

Maximum Coverage
Highest coverage but increased battery consumption.

This makes the AI decision-making more visible to judges.

18. WAYPOINT SYSTEM

Show numbered waypoints on the route.

Example:

WP01 → WP02 → WP03 → WP04...

Clicking a waypoint should display:

Waypoint ID
Latitude
Longitude
Altitude
Estimated Arrival Time
Battery Level
Action

Example:

WP27

Altitude: 80m
Battery: 83%
Action: Capture Survey Image

19. MISSION SIMULATION

Create a highly visual simulation.

When the user clicks:

START SIMULATION

show a drone icon moving along the generated route.

The camera should follow the drone optionally.

Animate:

Drone movement

Route progress

Waypoints

Battery decreasing

Distance increasing

Mission time increasing

Coverage percentage increasing

Show a mission progress bar.

Example:

MISSION IN PROGRESS

Progress: 47%

Distance: 3.9 / 8.42 km

Battery: 64%

Coverage: 45.7%

ETA: 09:51

20. LIVE MISSION PANEL

During simulation, show:

Drone Status

GPS:
LOCKED

Connection:
STABLE

Battery:
64%

Altitude:
82m

Speed:
8.1 m/s

Heading:
NE 42°

Current waypoint:
WP41

Mission:
ACTIVE

21. SAFETY SYSTEM

Create a safety monitoring system.

During simulation, randomly simulate realistic events occasionally.

Examples:

Battery Warning

"Battery reserve approaching return-to-home threshold."

GPS Warning

"GPS accuracy degraded."

Weather Warning

"Moderate wind detected. Route stability reduced."

Restricted Zone Alert

"Potential route conflict detected."

The system should never make dangerous claims about real-world flight safety. Clearly label the current system as a simulation/prototype and provide configurable safety thresholds rather than pretending to control a real aircraft.

22. RETURN-TO-HOME LOGIC

Implement a simulation of Return-to-Home planning.

The system should estimate whether the drone can:

Current Position → Home Point

while maintaining the configured battery reserve.

Display:

Return-to-Home Feasibility

✓ Safe

or

⚠ Battery Margin Low

The route should visibly show the RTH path.

23. MISSION COMPLETION

When the drone reaches the final waypoint:

Show a professional mission completion animation.

MISSION COMPLETE

Then show:

Coverage:
96.4%

Distance:
8.42 km

Flight Time:
18m 42s

Battery Used:
68%

Images Captured:
426

Waypoints Completed:
84/84

Mission Efficiency:
92/100

Then buttons:

View Mission Report

Replay Mission

Export Report

24. MISSION REPORT

Create a professional report page.

Include:

Mission Name
Mission Date
Drone
Operator
Mission Type
Survey Area

Route Map

Mission Statistics

Battery Graph

Altitude Graph

Speed Graph

Coverage Graph

Safety Events

AI Optimization Summary

Final Mission Score

Create a downloadable PDF report if technically feasible.

25. MISSION HISTORY

Create a Mission History page.

Each mission card should display:

Mission name
Date
Location
Mission type
Distance
Coverage
Battery usage
Efficiency score
Status

Example:

Mission #024

Agricultural Survey — Alexandria

Coverage: 97%
Efficiency: 94
Battery: 61%
Status: Completed

Allow:

View
Replay
Duplicate
Export
Delete

26. ANALYTICS DASHBOARD

Create a professional analytics page.

Display:

Total Missions
Total Flight Distance
Total Flight Time
Average Efficiency
Average Coverage
Battery Efficiency
Safety Events

Charts:

Mission efficiency over time

Battery consumption

Coverage percentage

Flight distance

Mission success rate

Use clean professional charts.

27. DRONE FLEET PAGE

Create a fleet management page.

Display drone cards:

Surveyor X1
Status: Ready
Battery: 96%
GPS: Locked
Health: Excellent

Surveyor X2
Status: Charging
Battery: 42%

Allow selecting a drone for a mission.

28. SETTINGS

Include:

Units:
Metric / Imperial

Map Style

Default Altitude

Default Speed

Battery Reserve

Return-to-Home Threshold

Safety Preferences

Simulation Speed

Theme

29. DEMO MODE FOR ITC

This is VERY IMPORTANT.

Create a dedicated:

ITC DEMO MODE

button.

When clicked, load a prepared mission automatically.

The demo should showcase the complete system in approximately 2–3 minutes.

Demo flow:

Step 1

Open mission planner.

Step 2

Show a predefined survey area.

Step 3

Show a restricted zone.

Step 4

Click:

Generate AI Mission

Step 5

AI optimization animation.

Step 6

Display generated route.

Step 7

Show mission score.

Step 8

Start simulation.

Step 9

Drone moves through the route.

Step 10

Trigger a simulated battery/weather warning.

Step 11

AI recalculates / adapts the mission.

Step 12

Mission completes.

Step 13

Display final report.

The demo should feel like a real autonomous mission-control workflow.

30. JUDGE-FRIENDLY EXPLANATION

Add an "About the Technology" section that clearly explains:

The Problem

Drone operators often manually plan missions, which can result in:

inefficient routes

unnecessary battery consumption

incomplete coverage

poor handling of restricted areas

difficult mission monitoring

The Solution

DroneRoute AI converts a mission objective into an optimized flight plan.

How It Works

Input

Mission Area + Drone Specs + Constraints

↓

AI Mission Engine

Route Optimization + Coverage Planning + Battery Estimation + Safety Validation

↓

Output

Optimized Flight Path + Mission Metrics + Simulation + Report

31. TECHNOLOGY STACK SECTION

Show the conceptual architecture:

Frontend:
React + TypeScript

UI:
Tailwind CSS + shadcn/ui

Mapping:
Mapbox / Leaflet

Visualization:
Recharts

Backend:
Supabase

AI / Optimization:
Modular route optimization engine

Data:
PostgreSQL

Authentication:
Supabase Auth

Make the architecture realistic and modular.

32. FUTURE REAL DRONE INTEGRATION

Very important:

The current prototype should clearly separate simulation from actual drone control.

Create a small section:

Future Integration

DroneRoute AI can later integrate with real drone systems through a secure drone communication layer / supported flight-control APIs.

Potential integrations:

MAVLink

PX4

ArduPilot

Telemetry systems

GPS

Real-time sensor feeds

Do NOT pretend that the current website is actually controlling a physical drone.

Instead, build the architecture so a real drone adapter can be added later.

33. RESPONSIVE DESIGN

The website must work perfectly on:

Desktop

Laptop

Tablet

The main mission-control interface should prioritize desktop because it is designed for operators and ITC demonstrations.

34. UX DETAILS

Add polished interactions:

Smooth page transitions

Animated route generation

Animated drone marker

Hover tooltips

Map controls

Loading states

Skeleton states

Toast notifications

Confirmation dialogs

Empty states

Error states

Success states

Never leave buttons non-functional.

Every major button must perform an action.

35. DATA MODEL

Create a realistic database structure.

Tables:

users
drones
missions
mission_areas
waypoints
restricted_zones
mission_events
mission_statistics
mission_reports

Use proper relationships.

36. DEMO DATA

Preload realistic demo data.

Example locations can include:

Alexandria

Cairo

New Cairo

Giza

Create several example missions.

Use fictional drone models and fictional telemetry data.

Do not imply the system has access to real restricted-airspace data unless connected to an authoritative live source.

37. IMPORTANT: MAKE IT FUNCTIONAL

Do NOT create a static mockup.

The following must actually work:

✓ Drawing a survey area
✓ Calculating area
✓ Creating restricted zones
✓ Selecting drone
✓ Changing parameters
✓ Generating a route
✓ Displaying route on map
✓ Calculating estimated distance
✓ Estimating mission duration
✓ Estimating battery usage
✓ Calculating coverage
✓ Generating waypoints
✓ Starting simulation
✓ Moving drone along route
✓ Updating telemetry
✓ Showing warnings
✓ Completing mission
✓ Generating mission report
✓ Mission history
✓ Analytics

If a real-world API is unavailable, create a clearly labeled deterministic simulation layer.

Do not fabricate live drone connectivity.

38. ERROR HANDLING

Handle cases such as:

No survey area selected

Invalid polygon

Route blocked by restricted zones

Insufficient battery

Impossible mission

No drone selected

Invalid parameters

Example:

MISSION CANNOT BE GENERATED

Reason:

"The selected area cannot be fully covered while maintaining the required 20% battery reserve."

Suggested actions:

Reduce Coverage

Increase Battery

Change Drone

Optimize Mission

39. PRESENTATION MODE

Create a special presentation mode optimized for ITC judges.

It should hide unnecessary controls and emphasize:

Map

Route

AI decision

Mission score

Battery

Coverage

Safety

Live simulation

Add a button:

Presentation Mode

This should make the UI look like a professional command center during the competition.

40. FINAL DESIGN QUALITY

The final result must feel like a serious startup/product prototype rather than a student CRUD project.

Prioritize:

Strong visual identity

Excellent map experience

Realistic mission simulation

Clear AI decision-making

Data visualization

Professional aerospace UI

Smooth animations

Functional interactions

Strong demo story

Clear technical architecture

The most important experience should be:

Draw Area → Configure Drone → Generate AI Mission → See Optimized Route → Start Simulation → Monitor Mission → Receive Report

Make this flow extremely polished because it will be the primary ITC judging demonstration.

Build the complete application now, including all pages, components, interactions, simulation logic, demo data, responsive layout, and professional UI.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://geo-flight-ai.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/29ead80c-5e89-4f02-8d5c-efa28a18e1b1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
