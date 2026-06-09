# [headway](https://headway-red.vercel.app)

> n. The distance or duration between vehicles in a transportation system.

<!-- ## the problem space: nonexistent trip scheduling -->

Like many people, an inconsistent schedule means I rarely take the same bus or train every morning. Even though I know my schedule days in advance, I end up either pre-planning with a paper schedule, or wait until day of to start a trip in a transit app.

This got me thinking: what if there was a way to schedule all my trips in advance?

## the solution

The solution I came up with is Headway, a forward-looking trip planner that integrates with your calendar to bypass the limitations of most transit apps that focus on real-time departures. It also allows you to save and share routes for later reference and/or repeated instances.

I wanted to build more of a proof of concept of a feature as part of an existing app. This is a small, focused tool that uses a simplified GTFS-based routing algorithm to determine trips, focusing on what a reliable future trip planner could look like.

## architecture

Headway is built with Next.js, React, and Tailwind.

While I had the option to host my own GTFS database comprised of publicly available GTFS feeds from the TTC and Metrolinx, I opted to use Transitland's API. This offloaded the heavy lifting of parsing GTFS files and let me focus on designing the feature itself.

I found that Transitland's text search for stops is highly fragmented (ie. stations are split into individual train platforms and bus bays instead of a single location). To solve this, I decoupled location searching from transit searching. OpenStreetMap's Nomatim API came in handy to geocode user inputs to coordinates, which the route planner then uses to search for stops within a set radius.

For this scale of concept, I decided to forgo a backend API and instead have the route planner run entirely in-browser. It fetches all scheduled departures within 600m of the origin, and arrivals within the same radius of the destination. The two are intersected based on the GTFS `trip_id` parameters.

Running with the theme of keeping things static and in-browser, I used `localStorage` instead of a database to save trips. Sharing is implemented by encoding search params into the URL query string, allowing state hydration and auto-trigger searches upon opening a shared link.

## technical challenges

1. Initially, the routing algorithm failed to find 'smaller' stops that weren't proper stations or bus loops (ie. streetside stops on bus/streetcar routes). I found Transitland's API filters were rather inconsistent across different TTC platforms, so I ended up removing restrictive operator filters during the initial coordinate search, instead moving the filtering stage to later in the algorithm after a wider set of stops were pulled.
2. Transit trips take time. Querying departures and arrivals for the exact same time naturally would fail to provide results for longer routes. I implemented a 3-hour look-ahead window on the destination query and explicitly did duration math (`arrivalTime - departureTime`) to validate directionality and ensure the vehicle was travelling in the right direction.
3. I initially populated the default date and time inputs during the component render. However, because Next SSRs the initial HTML, there was a mismatch between the server and client timestamps, resulting in React intentionally breaking the component tree and dropping event listeners. I fixed this by implementing a `mounted` state, rendering a skeleton UI on the server pass, and only populating time inputs **after** the browser took over.

## constraints

The goal for Headway was to demonstrate the calendar integration and forward-looking scheduling features, not necessarily to have a rich, intermodal transit routing system (something other transit apps already have figured out!)

1. Most importantly, **No Transfer Planning**. The algorithm only returns direct, single-seat routes. Trips requiring a modality switch or transfer will unfortunately return no results.
2. **Static GTFS Only** - **No** real-time data is used. Results shown reflect only published GTFS schedule times, not live vehicle positioning, delays, or detours.
3. **Approximated Walking Times** - Walk times to and from transit stops are "estimated" (read: hardcoded) at a flat 5 minutes rather than calculated via a pedestrian routing solution, again to reduce complexity.
4. **Toronto Only** - The stop-finding radius and operator filtering are hardcoded for just the TTC in Toronto, Ontario, which is the transit system I personally use every day. Expanding this to the full scale of agencies available in the Transitland API would require a lot more time and consideration, and that's not even considering my preferred solution of manually building a database of GTFS data.

## future improvements

If I were to scale this into a real application, the first thing I'd do would be to move away from keeping everything client-side and use something like OpenTripPlanner via a cloud VM - calculating real transfers in-browser with an API wrapper is far too complex to provide a pleasant user experience. A dedicated graph would make implementing all of the constraints detailed above, namely multimodal trips, actually doable and allow for proper caching, cloud calendar sync, and sharing functionality on top of accurate real-time schedule data.

Feature-wise, this would actually allow you to do something with your saved trips (ie. something like [Transit](https://transitapp.com/)'s GO feature!)
