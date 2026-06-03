# headway

> n. the time interval between two vehicles traveling in the same direction on the same route

## the problem space: nonexistent trip scheduling

I have quite an inconsitent daily schedule.
An 8AM Monday lecture, 12PM shift Wednesday, and 5PM hangout on Friday means I take a different bus or train almost every morning.

Even though I know days prior where I'm going and when, I have to wait until the moment I leave the house to either open [Transit](https://transitapp.com/) and set up my trip, or pre-plan my trips using the paper schedule from my local transit agency.
Not the end of the world, but certainly inconvenient.

This got me thinking: what if I could schedule all my trips in advance?

## the solution

The solution I came up with is Headway, a forward-looking transit trip planner that integrates with your calendar to enable forward trip planning, bypassing the limitations of most transit apps that focus on real-time departures.

If you need to know how to get to an unfamiliar part of an unfamiliar city tomorrow at 8AM, you're often forced to use generic map routing, which can obscure specific transit schedules or fail to account for temporary detours.

I wanted a simple, focused tool that queries raw GTFS schedule data to reliably plan future trips, allowing me to save and share those routes for later reference and/or repeated instances.

## architecture

I built Headway using Next.js, React, and Tailwind, leaning heavily on clientside state for interactivity.

While I had the option to host my own GTFS database comprised of publicly available GTFS feeds from the TTC and Metrolinx, I opted to use the Transitland v2 REST API. This offloaded the heavy lifting of parsing GTFS files and let me focus on designing the route matching algorithm, calendar integration, saving and sharing functionality.

I found that Transitland's text search for stops is highly fragmented (ie. Union Station in Toronto is split into individual train platforms and bus bays instead of a single location). To solve this, I decoupled location searching from transit searching. I used OpenStreetMap's Nomatim API to geocode user inputs to coordinates, which the planning algorithm then uses to search for stops within a set radius of those coordinates.

For this scale of concept, I decided to forgo a backend API and instead have the routing algorithm run entirely in-browser. It fetches all scheduled departures within 600m of the origin, and arrivals within the same radius of the destination. The two are intersected based on the GTFS `trip_id` parameters.

Running with the theme of keeping things static and in-browser for this PoC, I used `localStorage` instead of a database to save trips. Sharing is implemented by encoding search params into the URL query string, allowing Headway to hydrate state and auto-trigger searches upon opening a shared link.

## technical challenges

1. **GTFS Fragmentation**: Initially, the routing algorithm failed to find 'smaller' stops that weren't proper stations or bus loops (ie. streetside stops on bus/streetcar routes). I found Transitland's API filters were rather inconsistent across different TTC platforms, so I solved this issue by removing restrictive operator filters during the initial coordinate search, instead moving the filtering stage to later in the algorithm after a wider set of stops were pulled.
2. **Time Overlap / Pagination**: Somewhat obviously, transit trips take time. My initial approach to query departures and arrivals for the exact same time naturally failed to find intersections for long routes. I ended up implementing a 3-hour look-ahead window on the destination query and explicitly calculate duration math (`arrivalTime - departureTime`) to validate directionality and ensure the vehicle was travelling in the right direction.
3. **React Hydration Mismatches**: I initially populated the default date and time inputs during the component render. However, because Next SSRs the initial HTML, there was a mismatch between the server and client timestamps, resulting in React intentionally breaking the component tree and dropping event listeners. I fixed this by implementing a `mounted` state, rendering a skeleton UI on the server pass, and only populating time inputs **after** the browser took over.

## constraints

Because this project is more of a proof of concept rather than a feature-complete application, I intentionally limited the scope of the features.
The goal was to primarily demonstrate the calendar integration and forward-looking scheduling features, not necessarily to have a rich, intermodal transit routing system (something teams larger than me have figured out incredibly well!)

- Most importantly, **No Transfer Planning**. The algorithm only returns direct, single-seat routes. Trips requiring a modality switch or transfer will unfortunately return no results.
- **Toronto Restriction** The stop-finding radius and operator filtering are hardcoded for just the TTC in Toronto, Ontario, which is the transit system I personally use every day. Expanding this to the full scale of agencies available in the Transitland API would require a lot more time and consideration, and that's not even considering the preferred solution of manually building a database of GTFS data.
- **Static GTFS Only**: **No** real-time data is used. Results shown reflect only published GTFS schedule times, not live vehicle positioning or delays.
- **Approximated Walking Times**: Walk times to and from transit stops are "estimated" (read: hardcoded) at a flat 5 minutes rather than calculated via a pedestrian routing solution, again to reduce complexity
- **Local Storage**: Saved trips use localStorage instead of a cloud backend/db and do not sync across devices.

## future improvements

If I were to scale this into a real application, the first thing I'd do would be to move away from localStorage and client-side routing logic and use something like OpenTripPlanner via a cloud VM. Calculating real transfers in-browser with an API wrapper is far too complex to provide a pleasant user experience. A dedicated graph would make implementing all of the constraints detailed above, namely multimodal trips, actually doable and allow for proper caching, cloud calendar sync, and sharing functionality on top of accurate real-time schedule data.
